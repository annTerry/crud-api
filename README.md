# crud-api

- Запуск, на данный момент **npm run start:dev**
- В .env сейчас прописан порт 6000. Если файл убрать, порт по-умолчанию 4000;
- Реализация на Typescript
- Cluster API запускается через **npm run multi:dev**
- В консоль выводятся порты, и при отправке данных на каком порту (т.е. каким worker запрос обрабатывается).
- Данные при этом предполагается отправлять на основной порт (т.е. 6000 или 4000)
- Тесты и prod не делала, если успею - доделаю )))
