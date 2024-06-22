const getAllCoworkers = async (req, res) => {
  try {
    const { id } = req.user;
    console.log("User id:", id);
    console.log("Req.session:", req.session);
    res
      .status(200)
      .json("you are authenticated user, you can see all your coworkers");
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      message:
        "An error occurred while fetching users. Please try again later.",
    });
  }
};

module.exports = {
  getAllCoworkers,
};
