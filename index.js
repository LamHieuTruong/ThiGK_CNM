const express = require('express')
const app = express()
const port = 3000
const multer = require('multer')
const AWS = require('aws-sdk')
const upload = multer()

app.use(express.static('./templates'));
app.set('view engine', 'ejs');
app.set('views', './templates');

// require("dotenv").config({ path: __dirname + "/.env" });

AWS.config.update({
    region: 'ap-southeast-1',
    accessKeyId: 'AKIAZA6RFRKVNJLOTRGQ',
    secretAccessKey: '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'
})

const docClient = new AWS.DynamoDB.DocumentClient()
const tableName = 'Baibao2'

app.get('/', (req, res) => {
    const params = {
        TableName: tableName
    };
    docClient.scan(params, (err, data) => {
        if (err) {
            return res.send("ERROR: " + err);
        } else {
            console.log("Data: ", JSON.stringify(data));
            return res.render('index', { data: data.Items });
        }
    });
});

// app.post('/', upload.fields([]), (req, res) => {
//     console.log(req.body);
//     data.push(req.body)
//     return res.redirect('/');
// });

app.get('/them', (req, res) => {
    const params = {
        TableName: tableName 
    };
    docClient.scan(params, (err, data) => {
        if (err) {
            return res.send("ERROR: " + err);
        } else {
            return res.render('add');
        }
    });
});

app.post('/them', upload.fields([]), (req, res) => {
    console.log("req.body =", req.body);
    const { ten, isbn, namxb, sotrang, tacgia } = req.body;
    const params = {
        TableName: tableName,
        Item: {
            Tenbaibao: ten,
            ChisoISBN: isbn,
            NamxuatBan: namxb,
            Sotrang: sotrang,
            Tennhomtacgia: tacgia
        },
    };
    docClient.put(params, (err, data) => {
        if (err) {
            return res.send("error " + err);
        } else {
            return res.redirect("/");
        }
    });
});

app.post("/delete", upload.fields([]), (req, res) => {
    const listItems = Object.keys(req.body);

    if (listItems.length == 0) {
        return res.redirect("/");
    }

    function onDeleteItem (index) {
        const params = {
            TableName: tableName,
            Key: {
                Tenbaibao: listItems[index],
            },
        };

        docClient.delete(params, (err, data) => {
            if (err) {
                return res.send("error" + err);
            } else {
                if (index > 0) {
                    onDeleteItem(index - 1);
                } else {
                    return res.redirect("/");
                }
            }
        });
    }
    onDeleteItem(listItems.length - 1);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
