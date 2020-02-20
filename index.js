const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const database = require('./config')

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
    database.query('INSERT INTO comments (name, comment, created_at, updated_at) VALUES (?,?,?,?)', [name, comment, dateNow, dateNow], error => {
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

app.route('/comments').get(getComments).post(addComment)
app.route('/comments/:id').get(getComment).put(editComment).delete(deleteComment)

const port  = process.env.PORT

app.listen(port, () => {
    console.log(`server running on port ${port}`)
})