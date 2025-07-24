import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post('/submit', async (req, res) => {
  const { name, phone, comment } = req.body;
  console.log('Получены данные:', req.body);

  try {
    const contactResponse = await axios.post(process.env.CONTACT_URL, {
      fields: {
        NAME: name,
        PHONE: [{ VALUE: phone, VALUE_TYPE: 'WORK' }],
        COMMENTS: comment,
        SOURCE_ID: 'REPEAT_SALE'
      }
    });

    const contactId = contactResponse.data.result;

    if (!contactId) {
      throw new Error('Контакт не был создан. Ответ Bitrix: ' + JSON.stringify(contactResponse.data));
    }

    const dealResponse = await axios.post(process.env.WEBHOOK_URL, {
      fields: {
        TITLE: 'Новая заявка с квиза',
        CONTACT_ID: contactId,
        COMMENTS: comment,
        SOURCE_ID: 'REPEAT_SALE'
      }
    });

    res.status(200).json({ message: 'Контакт и сделка успешно созданы!' });
  } catch (error) {
    console.error('Ошибка при отправке данных в Битрикс:', error.response?.data || error.message);
    res.status(500).json({ error: 'Не удалось отправить данные в CRM' });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
