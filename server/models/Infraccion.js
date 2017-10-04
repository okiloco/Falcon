'use strict'

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Infraccion = Schema(
{
	"codigo":"String",
	"lote":"String",
	"placa":"String",
	"direccion":"String",
	"municipio":{"type":"ObjectId","ref":"ciudad"},
	"dispositivo":{"type":"ObjectId","ref":"camara"},
	"lat":"String",
	"long":"String",
	"videos":[{"video":{"type":"ObjectId","ref":"video"}}],
	"images":[{"video":{"type":"ObjectId","ref":"image"}}],
	"fecha":{"type":"Date", "default":"now"},
	"user":{"type":"ObjectId","ref":"user"}
	"estado":{"type":"Number", "default":"0"} 
}
);
{"codigo":"String","lote":"String","placa":"String","direccion":"String","municipio":{"type":"ObjectId","ref":"ciudad"},"dispositivo":{"type":"ObjectId","ref":"camara"},"lat":"String","long":"String","videos":[{"video":{"type":"ObjectId","ref":"video"}}],"images":[{"video":{"type":"ObjectId","ref":"image"}}],"fecha":{"type":"Date","default":"now"},"user":{"type":"ObjectId","ref":"user"},"estado":{"type":"Number","default":"0"}
{"codigo":"String","lote":"String","placa":"String","direccion":"String","municipio":{"type":"ObjectId","ref":"ciudad"},"dispositivo":{"type":"ObjectId","ref":"camara"},"lat":"String","long":"String","videos":[{"type":"ObjectId","ref":"video"}],"images":[{"video":{"type":"ObjectId","ref":"image"}}],"fecha":{"type":"Date","default":"now"},"user":{"type":"ObjectId","ref":"user"},"estado":{"type":"Number","default":"0"}}
mongoose.model("Infraccion",Infraccion);