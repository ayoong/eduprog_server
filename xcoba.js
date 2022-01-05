const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();


;(async () => {
    let tanggalAwal = new Date("2021-1-1").setDate(01);
    let tanggalAkhir = new Date("2021-1-1").setDate(31);

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



    console.log(data);
})();
