# Star Wars People

An Angular 22 application implementing the people-list and detail-view assignment with data from the [SWAPI](https://swapi.info/).

Live site: [https://immihaylov.github.io/st-wars/](https://immihaylov.github.io/st-wars/)

## Run locally

Install dependencies and start the development server:

```bash
npm install
npm start
```

Open <http://localhost:4200/> in your browser.

## Routes

| Path | View |
| --- | --- |
| `/start` | Assignment requirements and implemented features |
| `/people` | Searchable people list |
| `/people/:id` | People list with the selected person’s details |
| `/people?newPerson=true` | Temporary dialog navigation; the dialog opens from the Add person button, and Back closes it |

The root path `/` redirects to `/start`.

## Build and tests

Create a production build:

```bash
npm run build
```

Run the unit tests once:

```bash
npm test -- --watch=false
```
