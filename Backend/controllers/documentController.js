const Document = require("../models/document_Schema.js");
const User = require("../models/User_Schema.js");
const cloudinary = require("../config/cloudinary.js");
const sendEmail = require("../utils/send_Email.js");
const Project = require("../models/project_Schema.js");
const mongoose = require("mongoose");
const fs = require("fs");
const FRONTEND_URL = process.env.FRONTEND_URL;
const Email_Template = require("../utils/Email_Template.js");

const createDocument = async (req, res) => {
    try {
        const { name, description, documentType, projectId, allowedUsers } = req.body;
        if (!req.file)
            return res.status(400).json({ success: false, message: "File required" });

        let usersArray = allowedUsers.map(id => ({
            userId: id,
            permission: "view"
        }));

        if (usersArray.length < 1) {
            return res.status(400).json({ message: "Please select at least one user" });
        }

        let documentsUrls = [];
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "tasks/documents",
            resource_type: "raw", // IMPORTANT for pdf, docx, xlsx
            //resource_type: "auto", 
            //flags: "attachment"    // Optional: ensures it's treated as a file
            use_filename: true,
            unique_filename: true
        });
        const fileNameOnly = result.secure_url    //.split('/').pop();
        documentsUrls.push(fileNameOnly);

        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        const document = await Document.create({
            name,
            description,
            documentType,
            projectId,
            ownerId: req.user.id,
            allowedUsers: usersArray || [],
            file: [{
                fileName: result.original_filename,
                originalName: req.file.originalname,
                fileUrl: fileNameOnly,
                publicId: result.public_id,
                mimeType: req.file.mimetype,
                size: req.file.size
            }],
            createdBy: req.user.id
        });

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
        res.status(201).json({ type: "success", message: "Document created successfully and emails sent to assignees", data: document });
    }
    catch (error) {
        if (error.name === "ValidationError") {
            const firstError = Object.values(error.errors)[0].message;
            return res.status(400).json({ message: firstError });
        }
        res.status(500).json(error.message);
    }
};
const getDocuments = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const search = req.query.search?.trim() || "";
        const status = req.query.status || "";
        const projectId = req.query.projectId;
        const projectIds = req.query.projectIds;
        const skip = (page - 1) * limit;
        const userId = req.user.id;
        const isSuperAdmin = req.user.isSuperAdmin;

        const filter = { status: { $ne: "deleted" } };
        if (projectIds) {
            const ids = projectIds.split(",").map(id => new mongoose.Types.ObjectId(id));
            filter.projectId = { $in: ids };
        } else if (projectId) {
            filter.projectId = new mongoose.Types.ObjectId(projectId);
        }
        if (status && status !== "") {
            filter.status = status;
        }
        if (search !== "") {
            filter.name = { $regex: search, $options: "i" };
        }

        const project = await Project.findById(projectId);
        const projectName = project ? project.name : "Task Manager";

        const totalDocument = await Document.countDocuments(filter);

        const documents = await Document.find(filter)
            .populate("ownerId", "name email")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        // Add access control flags
        const result = documents.map(doc => {
            const isOwner = doc.ownerId && doc.ownerId._id.toString() === userId;
            const hasAccess = doc.allowedUsers.some(id => id.toString() === userId);
            const request = doc.accessRequests.find(r => r.userId.toString() === userId);

            return {
                ...doc.toObject(),
                canView: isOwner || hasAccess || isSuperAdmin,
                canEdit: isOwner || isSuperAdmin,
                requestStatus: request ? request.status : null
            };
        });

        res.status(200).json({
            success: true,
            data: result,
            total: totalDocument,
            page,
            limit,
            totalPages: Math.ceil(totalDocument / limit)
        });
    }
    catch (error) {
        if (error.name === "ValidationError") {
            const firstError = Object.values(error.errors)[0].message;
            return res.status(400).json({ message: firstError });
        }
        res.status(500).json(error.message);
    }
};

const viewDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id).populate("ownerId", "name");;
        if (!document)
            return res.status(404).json("Document not found");

        const userId = req.user.id.toString();
        const isOwner = document.ownerId._id.toString() === userId;
        // Safer way to check access in Mongoose arrays
        const hasAccess = document.allowedUsers.some(id => id.toString() === userId);

        if (!isOwner && !hasAccess)
            return res.status(403).json({ success: false, message: "Access denied" });

        res.json({ success: true, data: document });
    }
    catch (error) {
        if (error.name === "ValidationError") {
            const firstError = Object.values(error.errors)[0].message;
            return res.status(400).json({ message: firstError });
        }
        res.status(500).json("You has not permission to view document", error.message);
    }
};


const updateDocument = async (req, res) => {
    try {
        const { description, documentType, projectId, allowedUsers, name } = req.body;
        // Convert allowedUsers safely to array
        // ✅ Simple: convert all allowedUsers to objects with userId and permission
        let usersArray = (allowedUsers || []).map(id => ({
            userId: id,
            permission: "view"
        }));
        if (usersArray.length < 1) {
            return res.status(400).json({ message: "Please select at least one user" });
        }
        const document = await Document.findById(req.params.id);
        if (!document)
            return res.status(404).json({ success: false, message: "Document not found" });

        if (document.ownerId.toString() !== req.user.id)
            return res.status(403).json({ success: false, message: "Unauthorized" });

        let documentsUrls = document.file || [];

        if (req.body.removeFiles) {
            const removeFiles = [].concat(req.body.removeFiles);
            for (const fileName of removeFiles) {
                const fileToRemove = documentsUrls.find(f => f.fileUrl === fileName);
                if (fileToRemove?.publicId) {
                    await cloudinary.uploader.destroy(fileToRemove.publicId, { resource_type: "raw" });
                }
            }
            documentsUrls = documentsUrls.filter(f => !removeFiles.includes(f.fileUrl));
        }
        // Upload new files
        if (req.files?.file) {
            for (const file of req.files.file) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "tasks/documents",
                    resource_type: "raw",
                    use_filename: true,
                    unique_filename: true
                });
                documentsUrls.push({
                    fileName: result.original_filename,
                    originalName: file.originalname,
                    fileUrl: result.secure_url,
                    publicId: result.public_id,
                    mimeType: file.mimetype,
                    size: file.size
                });
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            }
        }
        // Store previous allowed users
        const previousUsers = (document.allowedUsers || []).map(u => u.userId.toString());
        // Update fields
        document.name = name || document.name;
        document.description = description || document.description;
        document.documentType = documentType || document.documentType;
        document.allowedUsers = usersArray;
        document.file = documentsUrls;
        document.updatedBy = req.user.id;
        await document.save();

        //Send email only to NEWLY added users
        const newUsers = usersArray.filter(
            u => !previousUsers.includes(u.userId.toString())
        );

        if (newUsers.length > 0) {
            const users = await User.find({ _id: { $in: newUsers.map(u => u.userId) } });
            const project = await Project.findById(projectId);
            const projectName = project ? project.name : "Task Manager";

            for (const user of users) {
                if (!user.email) continue;
                const documentRelativePath = `/?redirect=/documents/${document._id}`;
                const action = {
                    type: document.documentType,
                    label: "View Document",
                    link: documentRelativePath
                };
                const emailHtml = Email_Template(
                    user.name,
                    `A new document has been shared with you in the <strong>${projectName}</strong> workspace. You can now access and collaborate on this file directly from your dashboard.
                     \n Please click below button to show document`,
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
        res.json({
            type: "success",
            message: "Document updated successfully and Email Send To Alowed Users",
            data: document
        });

    } catch (error) {
        if (error.name === "ValidationError") {
            const firstError = Object.values(error.errors)[0].message;
            return res.status(400).json({ message: firstError });
        }
        res.status(500).json(error.message);
    }
};
const deleteDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json("Document not found");
        }
        if (document.ownerId.toString() !== req.user.id) {
            return res.status(403).json("Unauthorized");
        }
        if (document.file && document.file.length > 0) {
            const publicId = document.file[0].publicId;

            if (publicId) {
                cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
            }
        }
        document.status = "deleted";
        await document.save();

        return res.json({ type: "success", message: "Document deleted successfully" });
    }
    catch (error) {
        if (error.name === "ValidationError") {
            const firstError = Object.values(error.errors)[0].message;
            return res.status(400).json({ message: firstError });
        }
        res.status(500).json(error.message);
    }
};

const requestAccess = async (req, res) => {
    try {
        const { documentId, projectId } = req.body;
        const document = await Document.findById(documentId)
            .populate("ownerId", "name email");

        const user = await User.findById(req.user.id);

        const alreadyRequested = document.accessRequests.some(
            r => r.userId.toString() === req.user.id
        );

        // const alreadyAllowed = document.allowedUsers.some(
        //     id => id.toString() === req.user.id
        // );
        const alreadyAllowed = document.allowedUsers.some(
            u => u.userId.toString() === req.user.id
        );

        if (alreadyRequested)
            return res.json({ success: false, message: "Already requested" });

        if (alreadyAllowed)
            return res.json({ success: false, message: "Already have access" });


        document.accessRequests.push({
            userId: req.user.id,
            status: "pending"
        });
        await document.save();

        const reviewLink = `/?redirect=/document/request-review/${documentId}?userId=${user.id}`;
        const project = await Project.findById(projectId);
        const projectName = project ? project.name : "Task Manager";
        const action = {
            type: "access_request",
            label: "Review Request",
            link: reviewLink
        };
        const emailHtml = Email_Template(
            document.ownerId.name,
            `<strong>${user.name}</strong> has requested access to the document in project "<strong>${projectName}</strong>". 
             Please review this request and approve or reject it from your document account part.`,
            action,
            projectName
        );
        sendEmail({
            to: document.ownerId.email,
            subject: `Action Required: Document Access Request in ${projectName}`,
            html: emailHtml
        });
        res.json({ type: "success", message: "Access request sent to Project Owner" });
    }
    catch (error) {
        if (error.name === "ValidationError") {
            const firstError = Object.values(error.errors)[0].message;
            return res.status(400).json({ message: firstError });
        }
        res.status(500).json(error.message);
    }
};

const updateAccess = async (req, res) => {
    try {
        const { documentId, userId, status, projectId } = req.body;
        const document = await Document.findById(documentId)
            .populate("accessRequests.userId", "name email");
        if (!document)
            return res.status(404).json({ message: "Document not found" });

        if (document.ownerId.toString() !== req.user.id)
            return res.status(403).json({ message: "Unauthorized" });

        const requester = document.accessRequests.find(
            r => r.userId._id.toString() === userId
        );
        console.log(requester.userId.name);

        if (!requester)
            return res.status(400).json({ message: "Request not found" });
        const alreadyAllowed = (document.allowedUsers || []).some(
            u => u.userId.toString() === userId
        );
        if (status === "approved") {
            if (!alreadyAllowed) {
                document.allowedUsers.push({
                    userId: userId,
                    permission: "view"
                });
            }
        }
        // Remove request after decision
        document.accessRequests = document.accessRequests.filter(
            r => r.userId._id.toString() !== userId
        );
        await document.save();

        const documentLink = `/?redirect=/documents/${documentId}`;
        const project = await Project.findById(projectId);
        const projectName = project ? project.name : "Task Manager";
        const action =
            status === "approved"
                ? {
                    type: "document_view",
                    label: "View Document",
                    link: documentLink
                }
                : null;
        const message =
            status === "approved"
                ? `Your access request for the document in project "<strong>${projectName}</strong>" has been 
                   <strong style="color:green;">approved</strong>.
                   You can now access the document from your dashboard.`
                : `Your access request for the document in project 
                   "<strong>${projectName}</strong>" has been 
                   <strong style="color:red;">denied</strong>.
                   If you believe this was a mistake, please contact the document owner.`;

        const emailHtml = Email_Template(
            requester.userId.name,
            message,
            action,
            projectName
        );

        sendEmail({
            to: requester.userId.email,
            subject: `Action Required: Document Access ${status === "approved" ? "Approved" : "Denied"} - ${projectName}`,
            html: emailHtml
        });
        res.json({
            type: "success", message: `Access request is ${status}`
        });
    }
    catch (error) {
        if (error.name === "ValidationError") {
            const firstError = Object.values(error.errors)[0].message;
            return res.status(400).json({ message: firstError });
        }
        res.status(500).json(error.message);
    }
};

const createTextDocument = async (req, res) => {
    try {
        const { name, content, projectId, access } = req.body;

        const textDocument = await Document.create({
            name,
            documentType: "txt",
            content,
            projectId,
            ownerId: req.user.id,
            access
        })
        res.status(201).json({ type: "success", message: "Text Document created successfully", _id: textDocument._id });
    }
    catch (error) {
        if (error.name === "ValidationError") {
            const firstError = Object.values(error.errors)[0].message;
            return res.status(400).json({ message: firstError });
        }
        res.status(500).json(error.message);
    }
}

const updateTextDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, content, projectId, access } = req.body;

        const doc = await Document.findByIdAndUpdate(
            id,
            { name, content, projectId, access },
            { new: true }
        );
        if (!doc) {
            return res.status(404).json({ message: "Document not found" });
        }
        res.json({ document: doc });
    }
    catch (error) {
        if (error.name === "ValidationError") {
            const firstError = Object.values(error.errors)[0].message;
            return res.status(400).json({ message: firstError });
        }
        res.status(500).json(error.message);
    }
}
const viewTextDocument = async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) {
            return res.status(404).json({ message: "Document not found" });
        }
        res.json(doc);
    } catch (err) {
        res.status(500).json({ message: "Error fetching document" });
    }

};

module.exports = {
    createDocument,
    getDocuments,
    viewDocument,
    updateDocument,
    deleteDocument,
    requestAccess,
    updateAccess,
    createTextDocument,
    updateTextDocument,
    viewTextDocument
};