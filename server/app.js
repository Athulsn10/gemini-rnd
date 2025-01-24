require('dotenv').config()
const express = require('express');
const app = express();
const cors = require('cors');
const fileUpload = require('express-fileupload');
app.use(fileUpload());

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

const aiRoutes = require('./routes/routes');

app.use('/',  aiRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
