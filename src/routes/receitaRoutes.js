const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const Receita = mongoose.model("Receita");
const router = express.Router();
const multerConfig = require("../config/multer");
const { Ingest, Search } = require("sonic-channel");
const { v4: uuid } = require("uuid");
const { Client } = require("@elastic/elasticsearch");

const client = new Client({ node: "http://localhost:9200" });

router.get("/receitas", async (req, res) => {
  try {
    const receita = await Receita.find();
    res.send(receita);
  } catch (err) {
    return res.send({ error: err.message });
  }
});

router.get("/receitas/:nome", async (req, res) => {
  try {
    const termo = req.params.nome;

    const { body } = await client.search({
      index: "receitas",

      filterPath: ["hits.hits._source"],
      body: {
        query: {
          multi_match: {
            query: termo,
            fields: ["autor", "nome", "ingredientes"],
          },
        },
      },
    });
    /*body.hits.hits.map(function (hit) {
      return res.send(hit._source);
    });*/

    var result = body.hits.hits.map((hit) => hit._source);
    res.send(result);
  } catch (err) {
    return res.send("");
  }
});

router.get("/receita/:id", async (req, res) => {
  try {
    const termo = req.params.id;
    const receita = await Receita.findOne({ idReceita: termo });
    console.log(receita);
    res.send(receita);
  } catch (err) {}
});

/*router.get("/receita/:id", async (req, res) => {
  try {
    const termo = req.params.id;

    console.log(termo);
    const { body } = await client.search({
      index: "receitas",
      body: {
        query: {
          match: { idReceita: termo },
        },
      },
    });
    var result = body.hits.hits.map((hit) => hit._source);
    res.send(result);
  } catch (err) {
    return res.send({ error: err.message });
  }
});*/

/*router.get('/receitas/:autor', async (req, res) => {
  try {
    const autor = req.params.autor;

    const { body } = await client.search({
      index:'receitas',
      body: {
        query: {
          match: {
            query
          }
        }
      }
    })
  } catch (err) {
    return res.send({error:err.message})
  }
})
 


} */
router.post(
  "/receitas",
  multer(multerConfig).single("file"),
  async (req, res) => {
    const { location: img = "" } = req.file;
    console.log();
    const idReceita = uuid();

    const { nome, porcao, tempo, autor, ingredientes, passos, nota } = req.body;

    await client.index({
      index: "receitas",
      body: {
        img: img,
        idReceita: idReceita,
        autor: autor,
        nome: nome,
        ingredientes: ingredientes,
        passos: passos,
        porcao: porcao,
        tempo: tempo,
        idReceita: idReceita,
      },
    });
    await client.indices.refresh({ index: "receitas" });
    console.log(req.body);
    await Receita.create({
      idReceita,
      nome,
      porcao,
      tempo,
      nota,
      autor,
      ingredientes,
      passos,
      img,
    });
    return res.send({ msg: "Receita cadastrado com sucesso" });
  }
);
router.delete("/receitas/:receitaId", async (req, res) => {
  try {
    const id = req.params.receitaId;
    const receita = await Receita.findOne({ idReceita: id });
    await client.deleteByQuery({
      index: "receitas",
      body: {
        query: {
          match: { idReceita: id },
        },
      },
    });
    await receita.remove();
    res.send({ msg: "Receita deletada com sucesso" });
  } catch (err) {
    return res.send({ error: err.message });
  }
});

module.exports = router;
