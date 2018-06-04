[comment]: # (ACHTUNG! This is an autogenerated file and will be automatically overwritten)
[comment]: # (To edit its contents please refer to the project dir '.readme')

# Motion Bank Systems Frontend

> Combined frontend project for Motion Bank web services

[![Build status](https://secure.travis-ci.org/motionbank-js/motionbank-systems-frontend.svg)](https://travis-ci.org/motionbank-js/motionbank-systems-frontend)
[![Dependency Status](https://tidelift.com/badges/github/motionbank-js/motionbank-systems-frontend?style=flat)](https://tidelift.com/repo/github/motionbank-js/motionbank-systems-frontend)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/068aa9defed5426e91e2c2f4c1e2190d)](https://www.codacy.com/app/motionbank-js/motionbank-systems-frontend)
[![Maintainability](https://api.codeclimate.com/v1/badges/cba51f9e40aef7db5dec/maintainability)](https://codeclimate.com/github/motionbank-js/motionbank-systems-frontend/maintainability)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fmotionbank-js%2Fmotionbank-systems-frontend.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fmotionbank-js%2Fmotionbank-systems-frontend?ref=badge_shield)


## Install

```shell
npm install
```

## Run in third-party webserver

Point your webserver config to the ``dist`` directory. Configure your webserver to serve ``index.html`` with a 200 status code instead of a 404 error page.

## Run as standalone server

Execute ``npm start`` to start the built-in webserver. Control server address through ``HOST`` and ``PORT`` env variables.

## Customise

In order to customize the build, use these env vars:

```shell
API_HOST=http://localhost:3030 STREAMER_HOST=http://localhost:1234 npm run dev  # (or npm run build)
``` 

## Build

To remove any prior build artifacts run `npm run clean`.

```shell
npm run build
```

## Development

```shell
npm run dev
```


## License

:copyright: 2018 Mainz University of Applied Sciences (Motion Bank Project) – 
Released under the [MIT](https://github.com/motionbank-js/motionbank-systems-frontend/blob/master/LICENSE) license



[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fmotionbank-js%2Fmotionbank-systems-frontend.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fmotionbank-js%2Fmotionbank-systems-frontend?ref=badge_large)