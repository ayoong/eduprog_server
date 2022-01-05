const express = require('express');
const app = express();
const expressAsyncHandler = require('express-async-handler');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const { PrismaClient } = require('@prisma/client');
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
        data: ada ? data[0] : null,
        desc: ada ? "login succcess" : "wrong user or password"
    });
}))

app.get('/users', expressAsyncHandler(async (req, res) => {
    const data = await prisma.users.findMany();

    res.json(data);
}));


// untuk transaksi perharinya
app.get('/transaksi/:tanggal', expressAsyncHandler(async (req, res) => {
    const tanggal = req.params.tanggal;
    const data = await prisma.transaksi2.findMany({
        // skip: 0,
        // take: 200,
        // orderBy: {
        //     jam_in: "desc"
        // },
        select: {
            dt: true,
            supplier: true,
            jam_in: true,
            netto_rekon: true,
            tanggal_shift: true,
            tanggal_in: true
        },
        where: {
            tanggal_in: new Date(tanggal),

        }
    });
    res.json(data);
}));


// untuk transaksi perbulannya
app.get('/transaksiPerBulan/:tanggal', expressAsyncHandler(async (req, res) => {
    let tanggalAwal = new Date(req.params.tanggal).setDate(01);
    let tanggalAkhir = new Date(req.params.tanggal).setDate(31);

    var data = await prisma.transaksi2.groupBy({
        by: ["tanggal"],
        _count: {
            netto_rekon: true
        },
        _sum: {
            netto_rekon: true
        },
        where: {
            tanggal: {
                lte: new Date(tanggalAkhir),
                gte: new Date(tanggalAwal)
            },

        }
    });

    if(data || data.length != 0){
        data = data.map((e) => {
            return {
                tanggal: e.tanggal,
                rit: e._count.netto_rekon,
                tonase: e._sum.netto_rekon
            }
        })
    }
    res.json(data);
}));

app.get('/chart', expressAsyncHandler(async (req, res) => {
    let chart = await prisma.transaksi2.findMany({
        select: {
            jam_in: true,
            netto_rekon: true
        },
        orderBy: {
            jam_in: "asc"
        }
    })

    let data = chart.map((e) => {
        return {
            "jam": new Date(e.jam_in).getHours(),
            "net": e['netto_rekon']
        }
    }).sort(function (a, b) {
        return parseFloat(a.jam) - parseFloat(b.jam);
    });

    var output = data.reduce(function (accumulator, cur) {
        var jam = cur.jam;
        var found = accumulator.find(function (elem) {
            return elem.jam == jam
        });

        if (found) found.net += cur.net;
        else accumulator.push(cur);
        return accumulator;
    }, []);


    res.json(output)
}));


app.get('/transaksiBulan/:tanggal', expressAsyncHandler(async (req, res) => {
    let tanggalAwal = new Date(req.params.tanggal).setDate(01);
    let tanggalAkhir = new Date(req.params.tanggal).setDate(31);

    let bln = await prisma.transaksi2.findMany({
        select: {
            tanggal: true,
            netto_rekon: true
        },
        where: {
            tanggal: {
                lte: new Date(tanggalAkhir),
                gte: new Date(tanggalAwal)
            }
        }
    });

    let data = bln.map((e) => {
        return {
            "tanggal": new Date(e.tanggal).getDate(),
            "net": e['netto_rekon']
        }
    }).sort(function (a, b) {
        return parseFloat(a.jam) - parseFloat(b.jam);
    });

    var output = data.reduce(function (accumulator, cur) {
        var tanggal = cur.tanggal;
        var found = accumulator.find(function (elem) {
            return elem.tanggal == tanggal
        });

        if (found) found.net += cur.net;
        else accumulator.push(cur);
        return accumulator;
    }, []);


    return res.json(output);
}))


app.get('/ritAndTonase/:tanggal', expressAsyncHandler(async (req, res) => {
    let awal = new Date(req.params.tanggal);
    let akhir = awal.setDate(awal.getDate() + 1);


    let data = await prisma.transaksi2.aggregate({
        _count: true,
        _sum: {
            netto_rekon: true
        },
        where: {
            tanggal: {
                lte: new Date(akhir),
                gte: awal
            }
        }
    });

    res.json({
        "rit": data['_count'],
        "tonase": data['_sum']['netto_rekon']
    });
}))

app.get('/ritTonasePerBulan/:tanggal', expressAsyncHandler(async (req, res) => {
    let awal = new Date(req.params.tanggal).setDate(1);
    let akhir = new Date(req.params.tanggal).setDate(31);

    let data = await prisma.transaksi2.aggregate({
        _count: true,
        _sum: {
            netto_rekon: true
        },
        where: {
            tanggal: {
                // lower than or equal => lebih kecil dari atau sama dengan
                lte: new Date(akhir),
                // grather than or equal => lebih besar atau sama dengan
                gte: new Date(awal)
            }
        }
    });

    res.json({
        "rit": data['_count'],
        "tonase": data['_sum']['netto_rekon']
    });
}))


app.listen(3000, () => console.log('server run on port 3000'));
