const { resSuccess, resError } = require("../../services/responseHandler");
const prisma = require("../../prisma/client");
const { generateString } = require("../../util/string");

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
        console.log(error);
        return resError({
            res,
            title: "Failed to create locker device",
            errors: error,
        });
    }
};
