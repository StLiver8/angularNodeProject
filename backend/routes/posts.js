const express = require('express');

const Post = require('../models/post');
const checkAuth = require('../middleware/check-auth');
const extractFile = require('../middleware/file');

const router = express.Router();

router.post(
  '',
  checkAuth,
  extractFile,
  (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename,
    creator: req.userData.userId
  });
  post.save()
    .then(createdPost => {
      res.status(201)
        .json({
          massage: 'Post added successfully!',
          post: {
            // id: createdPost._id,
            // title: createdPost.title,
            // content: createdPost.content,
            // imagePath: createdPost.imagePath
            //  OR
            ...createdPost,
            id: createdPost._id
          }
        })
    })
    .catch(error => {
      res.status(500).json({
        message: 'Creating a post failed!'
      })
    });
});

router.put(
  '/:id',
  checkAuth,
  extractFile,
  (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + '://' + req.get('host');
    imagePath = url + '/images/' + req.file.filename;
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId
  });
  Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post)
    .then(result => {
      if (result.n > 0) {
        res.status(200).json({ message: 'Post updated successfully!' })
      } else {
        res.status(401).json({ message: 'User not authorized!' })
      }
    })
    .catch(error => {
      res.status(500).json({
        message: 'Updating post is failed!'
      })
    });
})

router.get(
  '',
  (req, res, next) => {
  let fetchedPosts;
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  if (pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  postQuery
    .then(documents => {
      fetchedPosts = documents;
      return Post.count();
    })
    .then(count => {
      res.status(200)
        .json({
          message: 'Posts fetched successfully!',
          posts: fetchedPosts,
          maxPosts: count
        });
    })
    .catch(error => {
      res.status(500).json({
        message: 'Fetching posts failed!'
      })
    });
});

router.get(
  '/:id',
  (req, res, next) => {
  Post.findById(req.params.id)
    .then(post => {
      if (post) {
        res.status(200).json(post)
      } else {
        res.status(404).json({ message: 'Post not found!' })
      }
    })
    .catch(error => {
      res.status(500).json({
        message: 'Fetching post failed!'
      })
    });
});

router.delete(
  '/:id',
  checkAuth,
  (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then(result => {
      if (result.n > 0) {
        res.status(200).json({ massage: 'Post deleted successfully!' })
      } else {
        res.status(401).json({ massage: 'User not authorized!' })
      }
    })
    .catch(error => {
      res.status(500).json({
        message: 'Deleting post failed!'
      })
    });
})

module.exports = router;
