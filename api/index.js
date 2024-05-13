const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs'); 

const salt = bcrypt.genSaltSync(10);
const secret = 'asdfe45we45w345wegw345werjktjwertkj';

app.use(cors({credentials:true,origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

mongoose.connect('mongodb+srv://blog:Oyj6R0x4n1tbT5wx@cluster0.naihgwt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

app.post('/register', async (req,res) => {
  const {username,password} = req.body;
  try{
    const userDoc = await User.create({
      username,
      password:bcrypt.hashSync(password,salt),
    });
    res.json(userDoc);
  } catch(e) {
    console.log(e);
    res.status(400).json(e);
  }
});
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const userDoc = await User.findOne({ username });

    if (!userDoc) {
      return res.status(400).json('User not found');
    }

    const passOk = bcrypt.compareSync(password, userDoc.password);

    if (passOk) {
      
      const token = jwt.sign({ username, id: userDoc._id }, secret);
      res.cookie('token', token, { httpOnly: true }).json({
        id: userDoc._id,
        username,
      });
    } else {
      
      res.status(400).json('Wrong credentials');
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json('Internal server error');
  }
});

app.get('/profile', (req,res) => {
  const {token} = req.cookies;
  jwt.verify(token, secret, {}, (err,info) => {
    if (err) throw err;
    res.json(info);
  });
});

app.post('/logout', (req,res) => {
  res.cookie('token', '').json('ok');
});

//testing


app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { originalname, path } = req.file;
  const parts = originalname.split('.');
  const ext = parts[parts.length - 1];
  const newPath = path + '.' + ext;
  fs.renameSync(path, newPath);

  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
    const { title, summary, content, lastDate } = req.body; 
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover: newPath,
      author: info.id,
      date: new Date(),
      lastDate: new Date(lastDate),
    });
    res.json(postDoc);
  });
});

// Post editing
app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
  let newPath = null;
  if (req.file) {
    const { originalname, path } = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    newPath = path + '.' + ext;
    fs.renameSync(path, newPath);
  }

  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
    const { id, title, summary, content, lastDate } = req.body; 
    const postDoc = await Post.findById(id);
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(400).json('you are not the author');
    }

    const updatedPost = await Post.findOneAndUpdate(
      { _id: id },
      {
        title,
        summary,
        content,
        cover: newPath ? newPath : postDoc.cover,
        lastDate: new Date(lastDate), 
      },
      { new: true }
    );

    res.json(updatedPost);
  });
});


//testing 

app.get('/post', async (req,res) => {
  res.json(
    await Post.find()
      .populate('author', ['username'])
      .sort({date: -1}) 
      .limit(20)
  );
});


app.get('/post/:id', async (req, res) => {
  const {id} = req.params;
  const postDoc = await Post.findById(id).populate('author', ['username']);
  res.json(postDoc);
});


app.put('/register/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.body.userId; 

    
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $addToSet: { registeredUsers: userId } }, 
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



//this last testing 

app.get('/posts/:id/registeredUsers', async (req, res) => {
  try {
    const postId = req.params.id;

    
    const post = await Post.findById(postId).populate('registeredUsers', 'username');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    
    const registeredUsers = post.registeredUsers.map((user) => ({
      id: user._id,
      username: user.username,
    }));

    res.json(registeredUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/register/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.body.userId; 

    // Find the post by ID and pull the userId from the registeredUsers array
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $pull: { registeredUsers: userId } }, 
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});





//over 

//testing 



app.listen(4000);
