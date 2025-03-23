let User = require('../model/users');

// Récupérer tous les utilisateurs (GET)
async function getUsers(req, res) {
  try {
    const users = await User.find().select("-password"); // Ne pas envoyer les mots de passe
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Récupérer un utilisateur par son ID (GET)
// router.get("/:id", async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id).select("-password");
//     if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// Création d'un utilisateur (POST)
async function newUser (req, res)  {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.json({ message: "Utilisateur créé avec succès" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Connexion d'un utilisateur (POST)
 async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Utilisateur non trouvé" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// // Mise à jour d'un utilisateur (PUT)
// router.put("/:id", async  function (req, res) => {
//   try {
//     const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password");
//     if (!updatedUser) return res.status(404).json({ message: "Utilisateur non trouvé" });
//     res.json({ message: "Utilisateur mis à jour", updatedUser });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// Suppression d'un utilisateur (DELETE)
 async function supUser (req, res) {
  try {
    const deletedUser = await User.findByIdAndRemove(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json({ message: `Utilisateur ${deletedUser.username} supprimé` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = router;
