const cloudinary = require("./Cloudinary");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const handleProfilePicture = async (req, res) => {
  try {
    const { image, id } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) {
      return res.status(404).json({ errorMessage: "USER NOT FOUND!" });
    }

    if (image) {
      const imageInfo = await cloudinary.uploader.upload(image, {
        folder: "chat_app",
        allowed_formats: ["jpg", "png"],
        gravity: "face",
        width: 133,
        height: 133,
        radius: "max",
        crop: "fill",
      });

      await prisma.user.update({
        where: { id: id },
        data: {
          profilePicture: imageInfo.url,
        },
      });

      return res.status(200).json({ imageInfo: imageInfo });
    } else {
      return res.status(400).json({ errorMessage: "Image is required!" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { handleProfilePicture };
