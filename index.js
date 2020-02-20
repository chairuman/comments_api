const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const database = require('./config')

const storage = multer.diskStorage({
    destination: function(request, file, callback){
        callback(null, 'public/uploads')
    },
    filename: function(request, file, callback){
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

const filterFile = function(request, file, callback){
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)){
        return callback(new Error('Opps, hanya boleh gambar'), false)
    }
    callback(null, true)
}

const upload = multer({ storage : storage, fileFilter : filterFile })

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended : true }))
app.use(cors())

//get all comments
const getComments = (request, response) => {
    database.query('SELECT * FROM comments ORDER BY id', (error, results) => {
        if(error){
            throw error
        }
        response.status(200).json(results)
    })
}
//get a comment
const getComment = (request, response) => {
    const id = request.params.id

    database.query('SELECT * FROM comments WHERE id=?', [id], (error, results) => {
        if(error){
            throw error
        }
        response.status(200).json(results)
    })
}
//post comment
const addComment = (request, response) => {
    const { name, comment } = request.body
    var dateNow = new Date()
    const image = request.file.filename

    database.query('INSERT INTO comments (name, comment, image, created_at, updated_at) VALUES (?,?,?,?,?)', [name, comment,image, dateNow, dateNow], error => {
        if(error){
            throw error
        }
        response.status(201).json({ status: 'success', message: 'comment added' })
    })
}
//edit comment
const editComment = (request, response) => {
    const { name, comment } = request.body
    const id = request.params.id
    const dateNow = new Date()

    database.query('UPDATE comments SET name = ?, comment = ?, updated_at = ? WHERE id = ?', [name, comment, dateNow, id], error => {
        if(error){
            throw error
        }
        response.status(200).json({ status: 'success', message: 'comment edited'})
    })
}
//delete comment
const deleteComment = (request, response) => {
    const id = request.params.id

    database.query('DELETE FROM comments WHERE id = ?', [id], error => {
        if(error){
            throw error
        }
        response.status(200).json({ status: 'success', message: 'comment deleted'})
    })
}

app.route('/comments').get(getComments).post(upload.single('image'),addComment)
app.route('/comments/:id').get(getComment).put(editComment).delete(deleteComment)

const port  = process.env.PORT

app.listen(port, () => {
    console.log(`server running on port ${port}`)
})