<template>
  <div class="hime-content">
    <hime-title-with-divider>{{ $t("menu.about") }}</hime-title-with-divider>
    <el-card :class="{ hide, expend }">
      <div class="hime-about__logo">
        <div class="icon" @click="toggleClass">
          <img :src="iconImage" alt="" />
        </div>
        <div class="hime-about__info">
          <div class="title">Hime Display</div>
          <div class="hime-about__info__item">Version 1.0.0</div>
          <div class="hime-about__info__item">
            Developed by
            <a href="https://github.com/TSKI433" @click.prevent="openLink"
              >TSKI433</a
            >
          </div>
          <div class="hime-about__info__item">
            Illustrated by
            <a
              href="https://www.pixiv.net/users/72669923"
              @click.prevent="openLink"
              >MakoSaikou</a
            >
          </div>
          <div class="hime-about__info__item">
            Special Thanks:
            <a href="https://github.com/greenjerry" @click.prevent="openLink"
              >greenjerry</a
            >
            |
            <a href="https://github.com/pure01fx" @click.prevent="openLink"
              >pure01fx</a
            >
          </div>
          <div class="hime-about__info__item">
            Links:
            <a
              href="https://github.com/TSKI433/hime-display"
              @click.prevent="openLink"
              >GitHub</a
            >
            |
            <a href="https://hime.xdrv.cn/" @click.prevent="openLink"
              >Documention</a
            >
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import HimeTitleWithDivider from "@control/components/Common/TitleWithDivider.vue";
import iconImage from "@control/assets/logo.png";
import { ref } from "vue";
const hide = ref(false);
const expend = ref(false);
function toggleClass() {
  if (expend.value) {
    expend.value = false;
    hide.value = true;
    setTimeout(() => {
      hide.value = false;
    }, 1000);
  } else {
    expend.value = true;
  }
}
function openLink(event) {
  window.nodeAPI.openLink(event.target.href);
}
</script>

<style lang="scss">
@keyframes rotate {
  0% {
    transform: rotate3d(0, 0, 0, 0deg);
  }
  70% {
    transform: rotate3d(0.3, 0.4, 0.2, 380deg);
  }
  85% {
    transform: rotate3d(0.3, 0.4, 0.2, 350deg);
  }
  100% {
    transform: rotate3d(0.3, 0.4, 0.2, 360deg);
  }
}
.el-card {
  margin-right: 178px;
  margin-left: 178px;
  transition: cubic-bezier(0.83, 0.28, 0.16, 0.98) 0.8s;
  border-radius: 16px;
  &.hide {
    .hime-about__logo {
      .icon {
        animation: rotate 1s cubic-bezier(0.53, 0.15, 0.57, 0.96);
      }
      .hime-about__info {
        opacity: 0;
      }
    }
  }
  &.expend {
    margin-right: 0;
    margin-left: 0;
    .hime-about__logo {
      .hime-about__info {
        opacity: 1;
      }
    }
  }
  .hime-about__logo {
    display: flex;
    position: relative;
    .icon {
      width: 220px;
      display: flex;
      justify-content: center;
      img {
        height: 180px;
      }
    }
    .hime-about__info {
      transition: cubic-bezier(0.8, 0.31, 0.08, 0.82) 1.2s;
      opacity: 0;
      white-space: nowrap;
      position: absolute;
      left: 220px;
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      align-items: flex-start;
      .title {
        font-size: 3rem;
        a {
          text-decoration: none;
          color: var(--el-text-color-primary);
        }
      }
      .hime-about__info__item {
        margin-top: 4px;
        font-size: var(--el-font-size-large);
        color: var(--el-text-color-secondary);
        a {
          text-decoration: none;
          color: var(--el-color-primary);
        }
      }
    }
  }
}
// .link-icon {
//   height: 1em;
//   width: 1em;
//   use {
//     fill: var(--el-text-color-secondary);
//   }
// }
</style>
