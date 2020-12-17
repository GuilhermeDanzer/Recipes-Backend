const mongoose = require("mongoose");

const receitasSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
  },
  porcao: {
    type: String,
    required: true,
  },
  tempo: {
    type: String,
    required: true,
  },
  nota: {
    type: Number,
    required: false,
  },
  autor: {
    type: String,
    required: false,
  },
  ingredientes: {
    type: Array,
    required: true,
  },
  passos: {
    type: Array,
    required: true,
  },
  img: {
    type: String,
    required: false,
  },
  key: {
    type: String,
    required: false,
  },
  nomeImagem: {
    type: String,
    required: false,
  },
  idReceita: { type: String, required: true },
});

receitasSchema.pre("remove", function () {
  console.log(this.key);
  return s3
    .deleteObject({
      Bucket: "imagefood",
      Key: this.key,
    })
    .promise();
});

mongoose.model("Receita", receitasSchema);
