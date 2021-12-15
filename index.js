const express = require('express');
const app = express();
const expressAsyncHandler = require('express-async-handler');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();



app.post('/login', expressAsyncHandler(async (req, res) => {
    const dataLogin = req.body;
    const data = await prisma.users.findMany({
        where: {
           user_name: dataLogin.user_name,
           user_password: dataLogin.user_password
        }
    });

    console.log(data);

    const ada = data.length > 0;
    res.json({
        success: ada,
        data: ada? data[0]: null,
        desc: ada?"login succcess": "wrong user or password"
    });
}))

app.get('/users', expressAsyncHandler(async (req, res) => {
    const data = await prisma.users.findMany();

    res.json(data);
}));

app.get('/transaksi', expressAsyncHandler(async (req, res) => {
    const data = await  prisma.transaksi2.findMany();
    res.json(data);
}));


app.listen(3000, () => console.log('server run on port 3000'));
