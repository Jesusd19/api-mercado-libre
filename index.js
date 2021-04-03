const { response, json } = require("express");
const express = require("express");
const fetch = require("node-fetch");
const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

app.get("/api/items", (req, res) => {
  fetch(`https://api.mercadolibre.com/sites/MLA/search?q=${req.query.q}`, {
    method: "GET",
  })
    .then((resp) => resp.json())
    .catch((error) => console.error("Error:", error))
    .then((respon) => {
      if (respon.results.length > 0) {
        const category = respon.filters.find((el) => el.id === "category");
        const categories = category.values[0].path_from_root.map(
          (el) => el.name
        );
        const items = [];
        for (let i = 0; i < 4; i++) {
          let el = respon.results[i];
          items.push({
            id: el.id,
            title: el.title,
            price: {
              currency: el.prices.prices[0].currency_id,
              amount: Math.trunc(el.prices.prices[0].amount),
              decimals: el.prices.prices[0].amount % 1,
            },
            picture: el.thumbnail,
            condition: el.condition,
            free_shipping: el.shipping.free_shipping,
          });
        }
        const data = {
          author: {
            name: "Jesús",
            lastname: "Barajas",
          },
          categories,
          items,
        };
        res.json(data);
      } else {
        getItemById(req.query.q).then(value => res.json(value)).catch((error) => console.error("Error:", error))
      }
    });
});

app.get("/api/items/:id", (req, res) => {
    getItemById(req.params.id).then(value => res.json(value)).catch((error) => console.error("Error:", error))
});

async function getItemById(id) {
  const data = await fetch(`https://api.mercadolibre.com/items/${id}`);
  const desc = await fetch(`https://api.mercadolibre.com/items/${id}/description/`);
  const description = await desc.json();
  const respon = await data.json()
  const value = {
    author: {
      name: "Jesús",
      lastname: "Barajas",
    },
    item: {
      id: respon.id,
      title: respon.title,
      price: {
        currency: respon.currency_id,
        amount: Math.trunc(respon.price),
        decimals: respon.price % 1,
      },
      picture: respon.pictures[0].url,
      condition: respon.condition,
      free_shipping: respon.shipping.free_shipping,
      sold_quantity: respon.sold_quantity,
      description: description.plain_text,
    },
  };
  return value;
}

app.listen(3000, () => console.log("Servidor listo..."));
