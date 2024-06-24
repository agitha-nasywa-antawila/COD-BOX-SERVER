const { resError, ErrorException } = require("../services/responseHandler");
const prisma = require("../prisma/client");
const jwt = require("jsonwebtoken");
const {
    getAuthorizationToken,
    getUser,
    getResetUrlPayload,
    hashValidator,
} = require("../services/auth");
const crypto = require("crypto");

const appLoginRequired = async (req, res, next) => {
    const jwtToken = await getAuthorizationToken(req);
    try {
        // check if token exits
        if (!jwtToken) return res.redirect("/auth/login");

        // find user
        const user = await prisma.user.findUnique({
            where: {
                id: jwtToken.userID,
            },
            select: {
                id: true,
                username: true,
                updatedAt: true,
                role: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        if (
            new Date(Number(jwtToken.iat * 1000)) <
            new Date(user.passwordUpdatedAt)
        )
            return res.redirect("/auth/login");

        if (!user) res.redirect("/auth/login");

        req.username = user.username;
        req.role = user.role.name;
        req.userid = user.id;
        if (user) return next();
    } catch (error) {
        return resError({
            res,
            title: "Cant find the user",
            errors: error,
            code: 401,
        });
    }
};

const appLogoutRequired = async (req, res, next) => {
    const jwtToken = await getAuthorizationToken(req);
    // check if token exits
    if (jwtToken) res.redirect("/");
    next();
};

const appAllowedRole = (...roles) => {
    return async (req, res, next) => {
        const userRole = req.role;

        if (!roles.includes(userRole)) {
            if (userRole == "SUPER ADMIN")
                return res.redirect("/admin/transaksi/riwayat");
            if (userRole == "BASE") return res.redirect("/user/transaksi/buat");
            if (userRole == "KURIR")
                return res.redirect("/kurir/pesanan/antar");
        }

        if (roles.includes(userRole)) return next();
    };
};

module.exports = {
    appLoginRequired,
    appLogoutRequired,
    appAllowedRole,
};
