FROM node:boron
MAINTAINER ACM@UIUC

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/
COPY package-lock.json /usr/src/
RUN cd /usr/src && npm install && cd /usr/src/app
ENV PATH /usr/src/node_modules/.bin:$PATH

# Bundle app source
COPY . /usr/src/app

EXPOSE 5000

CMD [ "npm", "start" ]
