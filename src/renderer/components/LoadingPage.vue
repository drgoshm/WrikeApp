<template>
  <div id="wrapper" class="row">
    <main>
      <div class="left-side">
        <div>
          <span id="logo" >App</span>
        </div>
        <span class="title">
          Welcome to your project manager!
        </span>
      </div>

      <div class="right-side">
        <div class="doc">
          <div class="title">Getting Started</div>
          <p>
            Organize everything you need to complete your project in one place with desktop client and in offline mode
          </p>
           <button @click="$router.push('/auth')" >Log in</button><br><br>
        </div>
        <div class="doc">
          <div class="title alt">Other Documentation will be here...</div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
  export default {
    name: 'landing-page',
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      route (page) {
        this.$router.push(page)
      }
    }
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body { font-family: 'Source Sans Pro', sans-serif; }

  #wrapper {
    background:
      radial-gradient(
        ellipse at top left,
        rgba(63, 76, 107, 1) 40%,
        rgba(0, 0, 0, .9) 100%
      );
    height: 100vh;
    padding: 60px 80px;
    width: 100vw;
  }

  #logo {
    height: auto;
    margin-bottom: 20px;
    width: 420px;
    position: relative;
    padding-left: 136px;
    color: #4fc08d;
    font-size: 2.6em;
    font-weight: 600;
  }

  #logo:before {
    background-image: url("data:image/svg+xml;charset=utf-8,%3C?xml version=%221.0%22 encoding=%22utf-8%22?%3E %3Csvg height=%2221%22 width=%2264%22 xmlns:xlink=%22http://www.w3.org/1999/xlink%22 xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 21%22%3E %3Cpath fill=%22%23ffffff%22 fill-rule=%22evenodd%22 d=%22M 10.86 4.26 L 7.15 15.4 L 3.76 4.31 L 0 4.31 L 5.52 20.85 L 8.51 20.85 L 12.17 9.88 L 15.77 20.85 L 18.76 20.85 L 24.3 4.31 L 20.61 4.31 L 17.23 15.4 L 13.49 4.26 L 10.86 4.26 Z M 10.86 4.26%22 /%3E %3Cpath fill=%22%23ffffff%22 fill-rule=%22evenodd%22 d=%22M 24.52 20.85 L 24.52 9.13 L 27.83 9.13 L 27.83 11.71 C 28.85 8.68 32.3 9.13 32.3 9.13 L 32.3 12.38 C 32.3 12.38 27.83 12.05 27.83 15.68 L 27.83 20.85 L 24.52 20.85 Z M 24.52 20.85%22 /%3E %3Cpath fill=%22%23ffffff%22 fill-rule=%22evenodd%22 d=%22M 33.85 20.85 L 33.85 13.63 L 37.16 10.47 L 37.16 20.85 L 33.85 20.85 Z M 33.85 20.85%22 /%3E %3Cpath fill=%22%23ffffff%22 fill-rule=%22evenodd%22 d=%22M 39.94 20.85 L 39.94 7.9 L 43.25 4.6 L 43.25 13.4 L 47.29 9.13 L 51.36 9.13 L 46.26 14.42 L 52.16 20.85 L 47.88 20.85 L 43.25 15.8 L 43.25 20.85 L 39.94 20.85 Z M 39.94 20.85%22 /%3E %3Cpath fill=%22%23ffffff%22 fill-rule=%22evenodd%22 d=%22M 59.79 13.72 C 59.72 12.44 58.81 11.4 57.35 11.4 C 55.87 11.4 54.87 12.35 54.71 13.72 L 59.79 13.72 Z M 53.31 19.33 C 52.08 18.22 51.46 16.73 51.46 14.9 C 51.46 13.18 52.02 11.74 53.13 10.58 C 54.24 9.4 55.7 8.82 57.49 8.82 C 59.18 8.82 60.51 9.42 61.5 10.61 C 62.5 11.79 63.01 13.23 63.01 14.95 L 63.01 15.8 L 54.71 15.8 C 55.05 17.38 56.54 18.22 58.58 18.22 C 59.88 18.22 61.11 17.87 62.29 17.2 L 62.29 19.82 C 61.25 20.61 59.79 21 57.88 21 C 56.08 21 54.54 20.44 53.31 19.33 L 53.31 19.33 Z M 53.31 19.33%22 /%3E %3Cpath fill=%22%2300a551%22 fill-rule=%22evenodd%22 d=%22M 40.58 0.38 L 33.17 7.79 L 35.37 10 L 44.99 0.38 L 40.58 0.38 Z M 40.58 0.38%22 /%3E %3Cpath fill=%22%23a5cd39%22 fill-rule=%22evenodd%22 d=%22M 34.05 4.27 L 29.65 4.27 L 35.37 9.99 L 37.58 7.79 L 34.05 4.27 Z M 34.05 4.27%22 /%3E %3C/svg%3E");
    content: '';
    background-repeat: no-repeat;
    background-size: cover;
    position: absolute;
    display: block;
    left: 0;
    top: 0;
    width: 62%;
    height: 81%;
  }

  main {
    display: flex;
    justify-content: space-between;
  }

  main > div { flex-basis: 50%; }

  .left-side {
    display: flex;
    flex-direction: column;
  }

  .welcome {
    color: #555;
    font-size: 23px;
    margin-bottom: 10px;
  }

  .title {
    color: #AAA;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 6px;
  }

  .title.alt {
    font-size: 18px;
    margin-bottom: 10px;
  }

  .doc p {
    color: white;
    margin-bottom: 10px;
  }

  .doc button {
    font-size: .8em;
    cursor: pointer;
    outline: none;
    padding: 0.75em 2em;
    border-radius: 2em;
    display: inline-block;
    color: #fff;
    background-color: #4fc08d;
    transition: all 0.15s ease;
    box-sizing: border-box;
    border: 1px solid #4fc08d;
  }

  .doc button.alt {
    color: #42b983;
    background-color: transparent;
  }
</style>
