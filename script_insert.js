import axios from "axios";

const json = {
  alias: "zzzBBVA",
  url: "https://zzzbbva.wd3.myworkdayjobs.com/es/BBVA?locationCountry=29247e57dbaf46fb855b224e03170bc7",
  mode: "prod",
  active: true,
  source: "https://bbva.wd3.myworkdayjobs.com/",
  comment: "Afinado",
  listPipeline: [
    { step: "getHtml", params: { type: "dynamic" } },
    {
      step: "extractFromHtml",
      params: [{ selector: "a", fields: ["text", { attr: "href" }] }],
    },
    {
      step: "filterData",
      params: [
        {
          selector: "a",
          field: "href",
          operator: "contains",
          value: "/es/BBVA/job/LONDON/",
        },
      ],
    },
    { step: "cleanData", params: [{ trim: true, removeDuplicates: true }] },
    {
      step: "transformData",
      enabled: true,
      params: {
        selector: "a",
        mapTo: { title: "text", url: "href" },
        addFields: {
          discoveredAt: "now",
          source: "https://bbva.wd3.myworkdayjobs.com/",
        },
        output: "array",
      },
    },
  ],
  detailPipeline: [
    { step: "getHtml", params: { type: "dynamic" } },
    { step: "extractJobDetailsBBVA" },
  ],
};

async function crearScrapSource(objeto) {
  try {
    const response = await axios.post(
      "http://localhost:5050/api/v1/scrapsources",
      objeto
    );
    console.log("Creado scrapSource:", response.data);
  } catch (error) {
    console.error(
      "Error al crear scrapSource:",
      error.response?.data || error.message
    );
  }
}

crearScrapSource(json);
