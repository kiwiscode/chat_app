const cloudinary = require("./Cloudinary");
const prisma = require("../util/PrismaConfig");

const handleProfilePicture = async (req, res) => {
  try {
    const { image } = req.body;
    const userId = req.params.userId;

    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(userId),
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
        where: { id: parseInt(userId) },
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
