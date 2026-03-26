
const Document = require("../models/document_Schema.js");
const DocumentPage = require("../models/page_Schema.js");
const User = require("../models/User_Schema.js");
const Project = require("../models/project_Schema.js");
const sendEmail = require("../utils/send_Email.js");
const Email_Template = require("../utils/Email_Template.js");
const mongoose = require("mongoose");
const pdf = require("html-pdf");

const MAX_PAGE_SIZE = 10 * 1024 * 1024; // 10MB

// ✅ SPLIT CONTENT INTO 10MB PAGES
const splitIntoPages = (content) => {
    const pages = [];
    let current = "";

    for (let i = 0; i < content.length; i++) {
        current += content[i];

        if (Buffer.byteLength(current, "utf8") >= MAX_PAGE_SIZE) {
            pages.push(current);
            current = "";
        }
    }

    if (current) pages.push(current);
    return pages;
};


// ✅ CREATE TEXT / DOCS DOCUMENT (COMMON)
const createPagedDocument = async (req, res) => {
    try {
        const { name, pages, projectId, allowedUsers, documentType } = req.body;

        if (!pages || !pages.length)
            return res.status(400).json({ message: "Pages required" });

        if (!["txt", "docx"].includes(documentType))
            return res.status(400).json({ message: "Invalid document type" });

        const usersArray = Array.isArray(allowedUsers)
            ? allowedUsers.map(u => ({
                userId: u.userId,
                permission: u.permission || "view"
            }))
            : allowedUsers ? [{ userId: allowedUsers, permission: "view" }] : [];

        if (usersArray.length < 1) {
            return res.status(400).json({ message: "Select at least one user" });
        }
        // ✅ CREATE MAIN DOCUMENT
        const document = await Document.create({
            name,
            documentType,
            projectId,
            ownerId: req.user.id,
            allowedUsers: usersArray,
            createdBy: req.user.id
        });

        // ✅ SPLIT INTO PAGES
        //const pages = splitIntoPages(content);

        const pageDocs = pages.map((page, index) => ({
            documentId: document._id,
            pageNumber: page.pageNumber || index + 1,
            content: page.content,
            size: Buffer.byteLength(page.content, "utf8"),
            createdBy: req.user.id
        }));

        await DocumentPage.insertMany(pageDocs);

        // ✅ EMAIL SAME AS YOUR LOGIC
        const userIds = usersArray.map(u => u.userId);
        const users = await User.find({ _id: { $in: userIds } });
        const project = await Project.findById(projectId);
        const projectName = project ? project.name : "Task Manager";
        for (const user of users) {
            if (!user.email) continue;
            //We don't need FRONTEND_URL inside documentLink if it's already in the template
            const documentRelativePath = `/?redirect=/documents/${document._id}`;

            const action = {
                type: documentType,
                label: "View Document",
                link: documentRelativePath
            };

            const emailHtml = Email_Template(
                user.name,
                `A new document has been shared with you in the <strong>${projectName}</strong> workspace. You can now access and collaborate on this file directly from your dashboard.
                 Please click below button to show document`,
                action,
                projectName
            );
            sendEmail({
                to: user.email,
                subject: `Action Required: View shared document in ${projectName}`,
                html: emailHtml
            });
        }
        res.status(201).json({
            type: "success",
            message: "Document created successfully.",
            totalPages: pages.length
        });

    } catch (error) {
        if (error.name === "ValidationError") {
            const firstError = Object.values(error.errors)[0].message;
            return res.status(400).json({ message: firstError });
        }
        res.status(500).json(error.message);
    }
};


// ✅ VIEW DOCUMENT (LAZY LOAD 5 PAGES)
const viewPagedDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const currentPage = Number(req.query.page) || 1;

        const document = await Document.findById(documentId);
        if (!document)
            return res.status(404).json({ message: "Document not found" });

        const userId = req.user.id.toString();
        const isOwner = document.ownerId.toString() === userId;
        const hasAccess = document.allowedUsers.some(id => id.toString() === userId);

        if (!isOwner && !hasAccess)
            return res.status(403).json({ message: "Access denied" });

        // ✅ LOAD ONLY CURRENT ±2 PAGES
        const pages = await DocumentPage.find({
            documentId,
            pageNumber: {
                $gte: currentPage - 2,
                $lte: currentPage + 2
            }
        }).sort({ pageNumber: 1 });

        const totalPages = await DocumentPage.countDocuments({ documentId });

        res.json({
            currentPage,
            totalPages,
            data: pages,
            name: document.name,
            documentType: document.documentType,
            projectId: document.projectId,
            allowedUsers: document.allowedUsers,
        });

    } catch (error) {
        res.status(500).json(error.message);
    }
};


// ✅ UPDATE PAGE CONTENT (ONLY ONE PAGE)
const updatePageContent = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { pages, name, allowedUsers, documentType, projectId } = req.body;

        // 1️⃣ Validate document
        const document = await Document.findById(documentId);
        if (!document) return res.status(404).json({ message: "Document not found" });

        // 2️⃣ Update document metadata
        if (name) document.name = name;
        if (documentType) document.documentType = documentType;

        // Normalize allowedUsers (array of objects with userId + permission)
        let usersArray = Array.isArray(allowedUsers)
            ? allowedUsers.map(u => ({ userId: u.userId, permission: u.permission || "view" }))
            : [];

        if (usersArray.length > 0) {
            document.allowedUsers = usersArray;
        }

        await document.save();

        // 3️⃣ Validate pages
        if (!pages || pages.length === 0) {
            return res.status(400).json({ message: "No pages provided" });
        }

        for (const p of pages) {
            if (!p.content || p.content.replace(/<[^>]*>/g, "").trim().length === 0) {
                return res.status(400).json({ message: `Page ${p.pageNumber} is empty` });
            }

            await DocumentPage.findOneAndUpdate(
                { documentId, pageNumber: p.pageNumber },
                { content: p.content, size: Buffer.byteLength(p.content, "utf8"), updatedBy: req.user.id },
                { upsert: true }
            );
        }

        // 4️⃣ Send email to newly added users
        if (usersArray.length > 0) {
            const previousUserIds = document.allowedUsers.map(u => u.userId.toString());
            const newUsers = usersArray.filter(u => !previousUserIds.includes(u.userId));

            if (newUsers.length > 0) {
                const userIds = newUsers.map(u => u.userId);
                const users = await User.find({ _id: { $in: userIds } });
                const project = await Project.findById(projectId);
                const projectName = project ? project.name : "Task Manager";

                for (const user of users) {
                    if (!user.email) continue;
                    const action = {
                        type: document.documentType,
                        label: "View Document",
                        link: `/?redirect=/documents/${document._id}`
                    };
                    const emailHtml = Email_Template(
                        user.name,
                        `A new document has been shared with you in <strong>${projectName}</strong> workspace. You can now access and collaborate on this file directly from your dashboard.`,
                        action,
                        projectName
                    );
                    sendEmail({
                        to: user.email,
                        subject: `Action Required: View shared document in ${projectName}`,
                        html: emailHtml
                    });
                }
            }
        }
        res.json({ type: "success", message: "Document updated successfully" });

    } catch (error) {
        if (error.name === "ValidationError") {
            const firstError = Object.values(error.errors)[0].message;
            return res.status(400).json({ message: firstError });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

// ✅ DOWNLOAD DOCUMENT
const downloadDocument = async (req, res) => {
    try {
        const { documentId } = req.params;

        const document = await Document.findById(documentId)
            .populate("ownerId", "name")
            .populate("projectId", "name");

        if (!document)
            return res.status(404).json({ message: "Document not found" });

        const pages = await DocumentPage.find({ documentId })
            .sort({ pageNumber: 1 });

        // Combine pages into one HTML string
        let content = pages.map((p, index) => `<div class="page"> ${p.content}</div>`).join("");

        const html = `
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; }

                .page {
                    page-break-after: always;
                    min-height: 1000px; /* adjust like A4 */
                    padding: 40px;
                }

                h2 { text-align: center; }
            </style>
        </head>
        <body>
            <h2>Company Name - Curbits Techlabs</h2>
            <p>Owner: ${document.ownerId.name}</p>
            <p>Project Name: ${document.projectId.name}</p>

            ${content}
            </body>
            </html>
            `;

        pdf.create(html).toBuffer((err, buffer) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Failed to generate PDF" });
            }

            res.setHeader(
                "Content-Disposition",
                `attachment; filename=${document.name || "Untitled"}.pdf`
            );
            res.setHeader("Content-Type", "application/pdf");
            res.send(buffer);

        });

    } catch (error) {
        if (error.name === "ValidationError") {
            const firstError = Object.values(error.errors)[0].message;
            return res.status(400).json({ message: firstError });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

// ✅ DELETE DOCUMENT + ALL PAGES
const deletePagedDocument = async (req, res) => {
    try {
        const { documentId } = req.params;

        const document = await Document.findById(documentId);
        if (!document)
            return res.status(404).json({ message: "Not found" });

        if (document.ownerId.toString() !== req.user.id)
            return res.status(403).json({ message: "Unauthorized" });

        await DocumentPage.deleteMany({ documentId });

        document.status = "deleted";
        await document.save();

        res.json({ type: "success", message: "Document Deleted successfully" });

    } catch (error) {
        res.status(500).json(error.message);
    }
};

module.exports = {
    createPagedDocument,
    viewPagedDocument,
    updatePageContent,
    downloadDocument,
    deletePagedDocument
};