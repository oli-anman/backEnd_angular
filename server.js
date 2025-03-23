let express = require('express');
let app = express();
let bodyParser = require('body-parser');

let assignment = require('./routes/assignments');

let mongoose = require('mongoose');
mongoose.Promise = global.Promise;
//mongoose.set('debug', true);

// remplacer toute cette chaine par l'URI de connexion à votre propre base dans le cloud s
const uri = 'mongodb+srv://anman:jeveuxmanger@cluster0.ysjb4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
// const uri= 'mongodb+srv://mb3:toto@cluster0.hswi4vv.mongodb.net/assignments?retryWrites=true&w=majority&appName=Cluster0'
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify:false
};

mongoose.connect(uri, options)
  .then(() => {
    console.log("Connecté à la base MongoDB assignments dans le cloud !");
    console.log("at URI = " + uri);
    console.log("vérifiez with http://localhost:8010/api/assignments que cela fonctionne")
    },
    err => {
      console.log('Erreur de connexion: ', err);
    });

// Pour accepter les connexions cross-domain (CORS)
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// Pour les formulaires
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

let port = process.env.PORT || 8010;

// les routes
const prefix = '/api';

app.route(prefix + '/assignments')
  .get(assignment.getAssignmentsAvecPagination);

app.route(prefix + '/assignments/:id')
  .get(assignment.getAssignment)
  .delete(assignment.deleteAssignment);


app.route(prefix + '/assignments')
  .post(assignment.postAssignment)
  .put(assignment.updateAssignment);

// Modèle User
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);

// Middleware pour protéger les routes
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Accès refusé" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: "Token invalide" });
  }
};

// Endpoint : Connexion
app.post(prefix + '/login', async (req, res) => {
  const { email, password } = req.body;

  // Vérifier si l'utilisateur existe
  const user = await User.findOne({ email });
  console.log('user', user);
  if (!user) return res.status(400).json({ message: "Utilisateur non trouvé " (user) }); 

  // Vérifier le mot de passe
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).json({ message: "Mot de passe incorrect" });

  // Générer un token JWT
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.json({ token });
});

// Endpoint : Profil utilisateur (Protégé)
app.get("/api/profile", verifyToken, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

// On démarre le serveur
app.listen(port, "0.0.0.0");
console.log('Serveur démarré sur http://localhost:' + port);

module.exports = app;


