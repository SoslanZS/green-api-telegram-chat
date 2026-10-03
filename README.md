# Telegram Chat на GREEN-API

Тестовое задание на позицию "Фронтенд разработчик React".

Простой веб-чат для отправки и получения текстовых сообщений в Telegram через [GREEN-API](https://green-api.com/telegram/). По заданию основной мессенджер MAX, но можно было выбрать WhatsApp или Telegram - я сделал для Telegram. Внешний вид по мотивам [web.telegram.org](https://web.telegram.org/).

Демо: https://soslanzs.github.io/green-api-telegram-chat/

## Что умеет

- вход по данным инстанса GREEN-API (`idInstance`, `apiTokenInstance`), данные проверяются через `getStateInstance`
- создание чата по номеру телефона получателя
- отправка текстовых сообщений методом [SendMessage](https://green-api.com/v3/docs/api/sending/SendMessage/)
- получение сообщений через [HTTP API](https://green-api.com/v3/docs/api/receiving/technology-http-api/): `ReceiveNotification` + `DeleteNotification`
- статусы исходящих: отправляется / отправлено / доставлено / прочитано / ошибка
- история чатов хранится в `localStorage`, отдельно для каждого инстанса
- адаптив: на телефоне показывается либо список чатов, либо открытый чат

## Стек

React 18, TypeScript, MobX, Vite, SCSS (БЭМ), Vitest. Состояние чатов хранится в MobX-сторе `ChatsStore`, компоненты получают его через контекст и обёрнуты в `observer`.

## Запуск

Нужен Node.js 18+.

```bash
git clone https://github.com/SoslanZS/green-api-telegram-chat.git
cd green-api-telegram-chat
npm install
npm run dev
```

Приложение откроется на http://localhost:5173

Другие команды:

```bash
npm test            # тесты
npm run typecheck   # проверка типов
npm run build       # сборка в dist/
npm run preview     # просмотр сборки
```

## Как проверить

1. Зарегистрироваться в [личном кабинете GREEN-API](https://console.green-api.com/), создать инстанс Telegram (тариф Developer бесплатный) и авторизовать его своим аккаунтом.
2. Открыть приложение и ввести `idInstance` и `apiTokenInstance`. `apiUrl` подставляется сам по первым 4 цифрам `idInstance` (например `4100...` -> `https://4100.api.green-api.com`). Если в кабинете указан другой адрес, его можно поменять в блоке "Дополнительно".
3. Нажать "+", ввести номер получателя и создать чат.
4. Написать сообщение. Когда получатель ответит в Telegram, ответ появится в чате.

## Как устроено

**chatId.** В Telegram `chatId` - это id пользователя, а не номер телефона. Поэтому при создании чата номер сначала проверяется методом `checkAccount`, он возвращает `{ exist, chatId }`. Входящие уведомления приходят с тем же `chatId`, по нему ответ и попадает в нужный чат.

**Получение.** Работает цикл long polling: `receiveNotification?receiveTimeout=20` -> обработка -> `deleteNotification/{receiptId}` -> снова. Удаляются все уведомления, в том числе те, которые чат не показывает, иначе очередь встанет на первом из них. При выходе из аккаунта цикл останавливается через `AbortController`.

**Отправка.** Сообщение сразу показывается со статусом "отправляется", после ответа сервера временный id меняется на `idMessage`. Дубль от уведомления `outgoingAPIMessageReceived` и статусы, которые иногда приходят раньше ответа `sendMessage`, обрабатываются в сторе.

## Структура

```
src/
  api/green-api.ts            запросы к GREEN-API
  types/                      типы приложения и ответов API
  stores/chats-store.ts       MobX-стор чатов: сообщения, статусы, отправка, создание чата
  hooks/useChatsStore.ts      доступ к стору из компонентов
  hooks/useNotifications.ts   цикл получения уведомлений
  utils/                      телефон, разбор уведомлений, время, localStorage
  components/
    index.ts                  экспорт всех компонентов
    Login/Form/
    Chat/                     Page, Sidebar, NewChat, Window, MessageList, Message, Composer
    ui/Avatar/
    icons/
  styles/base/                переменные, миксины, глобальные классы
tests/
```

Компоненты подключаются из одного места:

```ts
import { ChatPage, LoginForm } from '@/components';
```

## Деплой

Сборка и публикация на GitHub Pages настроены в `.github/workflows/deploy.yml` и запускаются при пуше в `main`. В настройках репозитория нужно один раз включить Settings -> Pages -> Source: GitHub Actions.

## Контакты

Сослан Болотаев - [Telegram](https://t.me/SoslanZS), [GitHub](https://github.com/SoslanZS), [резюме](http://soslan-frontend.online/)
