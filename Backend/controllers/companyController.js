const Company = require("../models/company_Schema.js");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/send_Email.js");
const Email_Template = require("../utils/Email_Template.js");
const User = require("../models/User_Schema.js");
const Role = require("../models/role_Schema.js");
const Staff = require("../models/User_Schema.js");
const Project = require("../models/project_Schema.js");
const Task = require("../models/Task_Schema.js");
const Issue = require("../models/Task_Schema.js");
const TaskStatus = require("../models/task_Status_Schema.js");
const Document = require("../models/document_Schema.js");
const Permission = require("../models/permission_Schema.js");


const createCompany = async (req, res) => {
    try {
        let { companyName, GSTNumber, companyEmail, phone, companyAddress, companyType, ownerName, ownerEmail, ownerPhone, password, status } = req.body;

        companyEmail = companyEmail.trim().toLowerCase();
        ownerEmail = ownerEmail.trim().toLowerCase();

        const emailExists = await Company.findOne({ ownerEmail });

        if (emailExists) {
            return res.status(400).json({ message: "Owner email already registered" });
        }
        const EmailExists = await Company.findOne({ companyEmail });

        if (EmailExists) {
            return res.status(400).json({ message: "Company email already registered" });
        }
        const hashed = await bcrypt.hash(password, 10);

        if (!status) {
            return res.status(400).json({ message: "Please select Status" });
        }

        const existing = await Company.findOne({ companyEmail });
        if (existing) {
            // If deleted → restore
            if (existing.status === "deleted") {
                existing.status = status || "Active";
                existing.companyName = companyName;
                existing.GSTNumber = GSTNumber;
                existing.companyEmail = companyEmail;
                existing.phone = phone;
                existing.companyAddress = companyAddress;
                existing.companyType = companyType;
                existing.ownerName = ownerName;
                existing.ownerEmail = ownerEmail;
                existing.ownerPhone = ownerPhone;
                existing.password = hashed;
                await existing.save();
                //req.io.emit("staffCreated", existing);
                return res.json({ type: "success", message: "Company Registered successfully and Email Send To company Owner" });
            }
            // If already active → error
            return res.status(400).json({ message: "Company already registered" });
        }
        const company = await Company.create({
            companyName,
            GSTNumber,
            companyEmail,
            phone,
            companyAddress,
            companyType,
            ownerName,
            ownerEmail,
            ownerPhone,
            status,
            password: hashed
        });
        const superAdminRole = await Role.findOne({ name: "SuperAdmin" });
        const companyOwnerRole = await Role.create({
            name: "CompanyOwner",
            permissions: [...superAdminRole.permissions],
            companyId: company._id,
            status: "Active"
        })
        await User.create({
            name: ownerName,
            email: ownerEmail,
            phone: ownerPhone,
            password: hashed,
            role: companyOwnerRole._id,
            isCompanyOwner:true,
            companyId: company._id,
            status: "Active"
        });
        const Path = `/?redirect=/company/${company._id}`;
        const emailBody = `
              <p>Your <b>${companyName}</b> company has been successfully registered in <b>Task Manager App</b>.</p>
              <p>You can now use the credentials below to log in as a company owner and start managing your work.</p>
              <p><b>Login Credentials:</b><br>
              <b>Password:</b>${password}<br>
              <b>Email:</b>${ownerEmail}<br>
              <p>Please click the button below to login and get started:</p>
              `;
        const html = Email_Template(
            ownerName,
            emailBody,
            {
                type: "Login Credentials",
                label: "Login Now",
                link: Path
            },
            "Task Manager"
        );
        sendEmail({
            to: ownerEmail,
            subject: "Task Manager App Login Credentials",
            html
        });
        //req.io.emit("staffCreated", staff);
        res.json({ type: "success", message: "Company Registered successfully and Email Send To company Owner", company });
    } catch (error) {
        if (error.name === "ValidationError") {
            const firstError = Object.values(error.errors)[0].message;
            return res.status(400).json({ message: firstError });
        }
        console.log("Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
const getCompany = async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const search = req.query.search || "";
    const status = req.query.status || "";
    const skip = (page - 1) * limit;

    const filter = { status: { $ne: "deleted" } };

    if (status && status !== "") {
        filter.status = status;
    } else {
        filter.status = { $ne: "deleted" };
    }
    if (search.trim() !== "") {
        filter.companyName = { $regex: search.trim(), $options: "i" };
    }
    const totalCompany = await Company.countDocuments(filter);

    const company = await Company.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)

    res.json({
        totalCompany,
        currentPage: page,
        totalPages: Math.ceil(totalCompany / limit),
        company
    });
};
//Update Task By Admin
const updateCompany = async (req, res) => {
    try {
        const companyId = req.params.id;
        let { companyName, GSTNumber, companyEmail, phone, companyAddress, companyType, ownerName, ownerEmail, ownerPhone, password, status } = req.body;

        const existingUser = await Company.findById(companyId);

        if (!existingUser) {
            return res.status(404).json({ message: "Company not found" });
        }
        const updateData = {};

        let isEmailChanged = false;
        if (ownerEmail) {
            ownerEmail = ownerEmail.trim().toLowerCase();

            if (ownerEmail !== existingUser.ownerEmail) {
                const emailExists = await Company.findOne({ ownerEmail });

                if (emailExists) {
                    return res.status(400).json({ message: "Email already in use" });
                }
                isEmailChanged = true;
            }
            updateData.ownerEmail = ownerEmail;
        }
        if (companyName) updateData.companyName = companyName;
        if (companyEmail) updateData.companyEmail = companyEmail;
        if (GSTNumber) updateData.GSTNumber = GSTNumber;
        if (phone) updateData.phone = phone;
        if (companyAddress) updateData.companyAddress = companyAddress;
        if (companyType) updateData.companyType = companyType;
        if (ownerName) updateData.ownerName = ownerName;
        if (ownerEmail) updateData.ownerEmail = ownerEmail;
        if (ownerPhone) updateData.ownerPhone = ownerPhone;
        if (password) {
            const hashed = await bcrypt.hash(password, 10);
            updateData.password = hashed;
        }
        const update = await Company.findByIdAndUpdate(
            companyId,
            updateData,
            { new: true, runValidators: true }
        );
        if (!update) {
            return res.status(404).json({ message: "Company not found" });
        }
        const ownerUser = await User.findOne({ companyId: companyId });
        if (ownerUser) {
            const userUpdateData = {};
            if (ownerName) userUpdateData.name = ownerName;
            if (ownerEmail) userUpdateData.email = ownerEmail;
            if (ownerPhone) userUpdateData.phone = ownerPhone;
            if (status) userUpdateData.status = status;
            if (password) {
                userUpdateData.password = await bcrypt.hash(password, 10);
            }
            // // Role Update
            // if (req.body.role) {
            //     const roleData = await Role.findOne({_id: req.body.role,companyId: companyId});
            //     if (!roleData) {
            //         return res.status(400).json({ message: "Invalid role" });
            //     }
            //     userUpdateData.role = roleData._id;
            // }
            await User.findByIdAndUpdate(ownerUser._id, userUpdateData);
        }

        const Path = `/?redirect=/company/${update._id}`;
        if (isEmailChanged) {
            let emailBody = `
              <p>Your <b>${update.companyName}</b> company data has been successfully updated in <b>Task Manager App</b>.</p>
              <p>You can now use the credentials below to log in as a company owner and start managing your work.</p>
              <p><b>Login Credentials:</b><br>
              <b>Email:</b>${update.ownerEmail}<br>
               Please login using your existing password.
              <p>Please click the button below to login and get started:</p>
              `;

            const html = Email_Template(
                ownerName,
                emailBody,
                {
                    type: "Login Credentials",
                    label: "Login Now",
                    link: Path
                },
                "Task Manager"
            );
            sendEmail({
                to: ownerEmail,
                subject: "Task Manager App Login Credentials",
                html
            });
        }
        // req.io.emit("staffUpdated", update);
        if (isEmailChanged) {
            res.json({ type: "success", message: "Company Data Updated Successfully and Email Send To Company Owner", update });
        } else {
            res.json({ type: "success", message: "Company Data Updated Successfully.", update });
        }
    } catch (error) {
        if (error.name === "ValidationError") {
            const firstError = Object.values(error.errors)[0].message;
            return res.status(400).json({ message: firstError });
        }
        res.status(500).json({ message: "Server error" });
    }
};

const deleteCompany = async (req, res) => {
    const company = await Company.findByIdAndUpdate(req.params.id, { status: "deleted" });
    //req.io.emit("staffDeleted", staff._id);
    res.json({ type: "success", message: "Company Data Deleted Successfully.", });
}

const getMyCompany = async (req, res) => {
    try {
        if(req.user.isSuperAdmin===true)return;
        const company = await Company.findOne({_id: req.user.companyId,status: { $ne: "deleted" } })
        .populate("subscription.planId");

        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }
        const companyId = company._id;
        const projects = await Project.find({companyId,status: { $ne: "deleted" }}).select("_id");
        const projectIds = projects.map(p => p._id);

        // Usage counts (IGNORE deleted data)
        const usage = {
            staff: await Staff.countDocuments({
                companyId,
                status: { $ne: "deleted" }
            }),

            role: await Role.countDocuments({
                companyId,
                status: { $ne: "deleted" }  
            }),

            project: await Project.countDocuments({
                companyId,
                status: { $ne: "deleted" }
            }),

            task: await Task.countDocuments({
                projectId: { $in: projectIds },
                type:"task",
                status: { $ne: "Deleted" }
            }),

            issue: await Issue.countDocuments({
                projectId: { $in: projectIds },
                type:"issue",
                status: { $ne: "Deleted" }
            }),

            taskstatus: await TaskStatus.countDocuments({
                projectId: { $in: projectIds },
                status: { $ne: "deleted" }   
            }),

            document: await Document.countDocuments({
                projectId: { $in: projectIds },
                status: { $ne: "deleted" }
            }),
        };

        res.json({ ...company.toObject(), usage });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const CompanyTiming = async (req, res) => {
    try {
        const companyId = req.user.companyId; 
        let {openingTime,closingTime,breakStart,breakEnd,workingDays,holidays} = req.body;

        const formattedHolidays = (holidays || []).map(h => ({
            date: new Date(h.date),
            title: h.title
        }));

        const company = await Company.findByIdAndUpdate(
            companyId,
            {
                timing: {
                    openingTime,
                    closingTime,
                    breakStart,
                    breakEnd,
                    workingDays,
                    holidays:formattedHolidays,
                }
            },
            { new: true, upsert: true }
        );

        res.json({type: "success",message: "Company timing saved successfully",timing: company.timing});

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getCompany, createCompany, updateCompany, deleteCompany,getMyCompany,CompanyTiming };
