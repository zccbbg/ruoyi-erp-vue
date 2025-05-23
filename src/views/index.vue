<template>
  <div class="app-container home">
    <el-row class="pl20 pr20" :gutter="10">
      <el-col :span="12">
        <el-card shadow="always" style="padding-bottom: 20px;font-size: 14px;margin-bottom: 20px; margin-top: 20px" >
          <div slot="header">
            <span style="font-size: large;font-weight: bold">招聘全栈开发</span>
          </div>
          <div style="display: flex;align-items: center">
            <div class="first" style="font-size:20px;line-height: 50px;background: linear-gradient(to right, red, blue);-webkit-background-clip: text;color: transparent;">
              参与开发基于jdk17和vue3的ruoyi-mall、ruoyi-erp-进销存。<br>
              要求：对若依框架和ruoyi-erp、ruoyi-mall 有一定的认知。并且有一定的空余时间。<br>
              全职、兼职、实习都可。我们在苏州，远程或现场参与开发都可。<br>
              有兴趣的可以在公众号内回复：应聘。<br>
            </div>
          </div>
        </el-card>
        <el-card shadow="always" style="padding-bottom: 20px;font-size: 14px;margin-bottom: 20px;" >
          <div slot="header">
            <span style="font-size: large;font-weight: bold">招聘自媒体运营</span>
          </div>
          <div style="display: flex;align-items: center">
            <div class="first" style="font-size:20px;line-height: 50px;background: linear-gradient(to right, red, blue);-webkit-background-clip: text;color: transparent;">
              参与ruoyi-wms、ruoyi-mall、ruoyi-erp-进销存项目的自媒体运营。<br>
              要求做过短视频编辑或公众号文章编辑，并且对我们的开源项目有一定的了解。<br>
              全职、兼职、实习都可。我们在苏州，远程或现场参与开发都可。<br>
              有兴趣的可以在公众号内回复：应聘。<br>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card style="padding-bottom: 20px; font-size: 14px">
          <div slot="header">
            <span style="font-size: large;font-weight: bold">发展历程</span>
          </div>
          <div style="padding-top: 20px">
            <el-timeline >
              <el-timeline-item placement="top" timestamp="2018年">
                <el-card>
                  <h4>参与京东服务市场商品分析应用开发，参与京东服务市场会员积分应用开发</h4>
                </el-card>
              </el-timeline-item>
              <el-timeline-item placement="top" timestamp="2019年">
                <el-card>
                  <h4>参与拼多多服务市场订单应用开发</h4>
                </el-card>
              </el-timeline-item>
              <el-timeline-item placement="top" timestamp="2020年">
                <el-card>
                  <h4>所参与开发的拼多多订单应用排名服务市场类目第一，开始快手服务市场订单应用开发</h4>
                </el-card>
              </el-timeline-item>
              <el-timeline-item placement="top" timestamp="2021年">
                <el-card>
                  <h4>日处理拼多多订单200万条，开始美团、饿了么应用市场应用开发</h4>
                </el-card>
              </el-timeline-item>
              <el-timeline-item placement="top" timestamp="2022年">
                <el-card>
                  <h4>累计服务10万+电商平台店铺、5万+外卖店铺。开始抖音、淘宝服务市场订单应用开发，开源ruoyi-wms</h4>
                </el-card>
              </el-timeline-item>
              <el-timeline-item placement="top" timestamp="2023年">
                <el-card>
                  <h4>B站播放量破万，开源ruoyi-mall，公众号粉丝破万，wms-saas火热研发中</h4>
                </el-card>
              </el-timeline-item>
              <el-timeline-item placement="top" timestamp="2024年">
                <el-card>
                  <h4>开源项目gitee star 8000+，公众号单篇文章阅读量破5w</h4>
                </el-card>
              </el-timeline-item>
              <el-timeline-item placement="top" timestamp="2025年">
                <el-card>
                  <h4>开源ruoyi-erp</h4>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Index">
const version = ref('5.2.0')

function goTarget(url) {
  window.open(url, '__blank')
}
</script>

<style scoped lang="scss">
.home {
  blockquote {
    padding: 10px 20px;
    margin: 0 0 20px;
    font-size: 17.5px;
    border-left: 5px solid #eee;
  }
  hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
    border-top: 1px solid #eee;
  }
  .col-item {
    margin-bottom: 20px;
  }

  ul {
    padding: 0;
    margin: 0;
  }

  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 13px;
  color: #676a6c;
  overflow-x: hidden;

  ul {
    list-style-type: none;
  }

  h4 {
    margin-top: 0px;
  }

  h2 {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 100;
  }

  p {
    margin-top: 10px;

    b {
      font-weight: 700;
    }
  }

  .update-log {
    ol {
      display: block;
      list-style-type: decimal;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0;
      margin-inline-end: 0;
      padding-inline-start: 40px;
    }
  }
}
</style>

