const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/", async (req, res) => {
  try {
    const data = req.body;

    // Создание контакта
    const contactPayload = {
      fields: {
        NAME: data.name || "",
        PHONE: [{ VALUE: data.phone || "", VALUE_TYPE: "WORK" }],
        SOURCE_ID: "REPEAT_SALE", // Источник: Повторная продажа
      },
    };

    const contactResponse = await axios.post(
      process.env.CONTACT_URL,
      contactPayload
    );

    const contactId = contactResponse.data.result;

    // Создание сделки
    const dealPayload = {
      fields: {
        TITLE: "Заявка с Tilda",
        CONTACT_ID: contactId,
        SOURCE_ID: "REPEAT_SALE",
        UF_CRM_1753266032459: data.UF_CRM_1753266032459 || "",
        UF_CRM_1753266055460: data.UF_CRM_1753266055460 || "",
        UF_CRM_1753266077847: data.UF_CRM_1753266077847 || "",
      },
    };

    const dealResponse = await axios.post(
      process.env.WEBHOOK_URL,
      dealPayload
    );

    res.status(200).send({
      success: true,
      contact: contactResponse.data,
      deal: dealResponse.data,
    });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).send({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
