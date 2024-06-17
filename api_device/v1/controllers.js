const { resSuccess, resError } = require("../../services/responseHandler");
const prisma = require("../../prisma/client");
const { generateString } = require("../../util/string");

exports.deviceList = async (req, res) => {
    try {
        const item = Number(req.query?.item) ? Number(req.query.item) : 100;
        const search = req.query?.search ? req.query.search : "";
        const cursor = req.query?.cursor ? req.query.cursor : "";
        let searchQuery = {};
        let cursorQuery;
        let skipRecord = 0;

        if (cursor) {
            skipRecord = 1;
            cursorQuery = {
                cursor: {
                    id: cursor,
                },
            };
        }

        if (search) {
            searchQuery = {
                name: {
                    contains: search,
                    mode: "insensitive",
                },
            };
        }

        const data = await prisma.device.findMany({
            where: searchQuery,
            take: item,
            skip: skipRecord,
            ...cursorQuery,
            select: {
                id: true,
                name: true,
                kode: true,
            },
        });

        return resSuccess({
            res,
            title: "Success get device list",
            data: data,
        });
    } catch (error) {
        return resError({
            res,
            title: "Failed to get device list",
            errors: error,
        });
    }
};

exports.createDevice = async (req, res) => {
    try {
        const kodeDevice = generateString(5);

        const countDevice = await prisma.device.count();

        const newDevice = await prisma.device.create({
            data: {
                kode: kodeDevice,
                name: `COD BOX - ${countDevice + 1}`,
            },
        });

        return resSuccess({
            res,
            title: "Success create locker",
            data: newDevice,
        });
    } catch (error) {
        return resError({
            res,
            title: "Failed to create device",
            errors: error,
        });
    }
};

exports.openDevice = async (req, res) => {
    try {
        const { kode_box, type, token } = req?.body;

        const device = await prisma.device.findUnique({
            where: {
                kode: kode_box,
            },
        });

        if (!device) throw "Device tidak ditemukan";
        if (!device?.token) throw "Token tidak ditemukan";
        if (device.token != token) throw "Token tidak sesuai";
        if (new Date(device.tokenExpiredAt) < new Date())
            throw "Token kadaluarsa";

        await prisma.device.update({
            where: {
                id: device.id,
            },
            data: {
                tokenExpiredAt: null,
                token: null,
            },
        });

        return resSuccess({
            res,
            title: "Success open box",
            data: {
                type,
            },
        });
    } catch (error) {
        return resError({
            res,
            title: "Failed to open device",
            errors: error,
        });
    }
};
