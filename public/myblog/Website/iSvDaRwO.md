
<a id="top"></a>

# 【图文教程】保姆级教程：从零开始，手把手带你部署属于自己的稳定高速图床 🖼️🚀

众所周知，作为一个网站的运营者，图床几乎是不可或缺的工具：它能显著降低你自己服务器的带宽与存储压力，而且上手也很快。  
网络上的免费图床虽然常见，但也伴随不少风险：高负荷期间访问速度变慢；链接稳定性难以保证（资源是否 404 很大程度取决于平台方）；隐私与版权不可控，图片可能被扫描、缓存、复用，甚至被公开索引。

作为临时分享或聊天用图，免费图床确实是个不错的选择；但当图床中的图片成为博客、技术文档、长期项目的一部分时，免费图床的问题就会暴露：谁也无法保证链接能否一直稳定，会不会某天突然“炸了”。（博主本人就踩过坑：头像上传到某个免费图床，一周不到链接就挂了 qwq）

所以在本篇博客中，我将介绍如何使用 **GitHub + Vercel + Cloudflare 加速**，以零成本搭建属于你自己的图床。

---

<a id="toc"></a>

## 目录 📌

- [图床效果展示](#demo)
- [你需要准备的材料](#prep)
- [第一步：创建 GitHub 仓库存放图片](#step1)
- [第二步：准备本地图片上传工具](#step2)
  - [获取 GitHub Personal Access Token](#token)
  - [下载并配置本地上传工具](#uploader)
- [第三步：用 Vercel 部署并用 Cloudflare 加速域名](#step3)
  - [部署到 Vercel](#vercel)
  - [绑定域名并配置 DNS（Cloudflare 示例）](#dns)
- [完成与联系](#finish)

---

<a id="demo"></a>

## 图床效果展示 ✨

这是我们将会制作的图床上传界面。（PS：这张图片本身就托管在我自己搭建的图床上。）  
![图床上传界面](https://image-host.blueberryowo.me/ea784a94-a0ca-4c53-b8c4-a52378b32d4b.png)

这是图床的访问速度：  
![图床国内访问速度](https://image-host.blueberryowo.me/87028651-9524-4fc1-9b00-1bbbdb852afd.png)  
![图床国外访问速度](https://image-host.blueberryowo.me/38d2d9bc-7637-4bf4-afaf-172067963817.png)

[⬆️ 返回目录](#toc)

---

<a id="prep"></a>

## 你需要准备的材料 ✅

- 一个 Github 账户（没有 github 账户的可以看[这个链接](https://zhuanlan.zhihu.com/p/805391882)注册 github）
- 一个自己的域名，并且托管到 cloudflare 用来加速访问（当然如果没有也能用，但大陆访问速度可能会慢一点；国外访问速度依旧会很快）

[⬆️ 返回目录](#toc)

---

<a id="step1"></a>

## 第一步：创建一个 GitHub 仓库用来存放你的图床图片 📦

建议直接 fork 我已经写好的仓库模板：

1. 打开[我已经写好的image-host模板仓库](https://github.com/LeoWang0814/image-host)
2. 点击页面右上方的 “fork” 按钮（PS：可以顺手点一下右边的 star 支持一下我 owo）

   ![fork我的图床模板](https://image-host.blueberryowo.me/9681c409-9229-4a3e-bc0e-c3c5418ce5e0.png)

3. 在弹出的页面上可以自定义一个仓库名字（repository name），自定义一段仓库描述（description），然后最后点击右下角的 create fork，通过复制我的图床仓库模板来创建你自己的仓库。

   ![填写仓库名字并且创建fork](https://image-host.blueberryowo.me/3e7db3f3-bb44-49e9-ae0e-1aa7fa83098f.png)

到这里，我们图床的图片存储仓库就创建好了。接下来，我们来准备桌面上传图片用的工具。

[⬆️ 返回目录](#toc)

---

<a id="step2"></a>

## 第二步：准备本地的图片上传工具 🧰

<a id="token"></a>

### 首先：获取你自己的 GitHub Personal Access Tokens 🔐

1. 首先，在[github主页](https://github.com/)点击右上角自己的头像，然后在跳出来的选项卡里面点击 setting。

   ![点击自己的头像](https://image-host.blueberryowo.me/b2adacfb-3976-4bf0-ad56-1d5f036b447c.png)

2. 在跳出来的界面往下滚动，在左边栏里找到 Developer settings，点击。

   ![点击Developer settings](https://image-host.blueberryowo.me/5962768b-d8d7-4bf6-8de0-0805103aff08.png)

3. 在跳转到的页面中先点击左边的 Personal access tokens 展开选项卡片，然后点击下面的 Fine-grained tokens，最后点击屏幕中间部分的 Generate new token。

   ![选择Fine-grained tokens，点击generate new token](https://image-host.blueberryowo.me/1b953084-bac0-419a-b56a-78b002cd9bfb.png)

4. 在跳出来的界面里面填写你的 Token name（也就是这个密钥的名称）；下面写一段 Description，描述你的 token 的用途；Expiration（有效期）部分我建议选择 30 天比较安全（每 30 天手动更换，避免不小心泄露）。如果你不想每个月都更新，也可以选择永久（不推荐）。下面 Repository access 选择 Only selected repositories，并且选择我们刚刚 fork 的那个图床模板。

   ![输入图片说明](https://image-host.blueberryowo.me/c5ce9e0a-1272-42d7-a093-bbac77391c5d.png)

5. 往下翻，在 permissions 部分点击右侧的 “+Add permissions”，在跳出来的选项卡里选择 “Contents”（为了允许持有这个 token 的人往仓库里添加文件）。**请注意，一定一定要手动把Contents右边的Access改成Read and Write（默认是只读），否则无法上传图片！！！** 最后点击最下面的 Generate token 创建这个有权限的 token。

   ![选择合适的权限](https://image-host.blueberryowo.me/a89d853b-db11-4cf1-af1a-f62a9e6dab2c.png)
   ![修改权限为Read and Write](https://image-host.blueberryowo.me/ea000c4a-df0e-4264-8627-e0a078205714.png)
   在跳出来的页面里面再点击一次 Generate token。（图片中有个错误，如果你上面已经修改好了那么应该在content右边显示read and write！！！）  
   ![再次点击Generate token](https://image-host.blueberryowo.me/22e21f20-7894-4714-b007-5706225dd7fd.png)

6. **保存好你的 token！！！** 不要把 token 泄露给别人，也不要弄丢。你离开这个页面之后就无法再看到 token 了，所以请把它保存在一个安全稳定的地方。

<a id="uploader"></a>

### 接下来：部署本地的图片上传工具 🖥️

1. 打开[这个链接](https://github.com/LeoWang0814/image-host-backend)，在这个仓库中我已经部署了一版只要填写几个信息就可以 *开箱即用* 的本地图片上传工具。

   ![图床上传器预览](https://image-host.blueberryowo.me/97b5a3e9-70b6-49c9-8f6e-0e1f1ff29207.png)

2. 点击页面中的 “code” 按钮，在弹出的选项卡中选择 “download zip”。

   ![下载本地图床上传工具](https://image-host.blueberryowo.me/7b20a847-b3aa-442b-9e28-58c90419a29b.png)

3. 解压压缩包，并且把压缩包中的 `index.html` 文件放置到一个你方便使用的位置。我们之后都将使用这个本地网页工具来上传图片到图床。

   ![解压并且拖拽出上传工具](https://image-host.blueberryowo.me/5369ae23-c34b-4eab-9b42-3202212cbc91.png)

4. 右键解压好的 `index.html`，然后选择用你的编辑工具打开。这里为了方便演示，我使用大家设备上基本都有的记事本进行演示；如果你有更专业的编辑器当然更好。

   ![选择在记事本或者其他编辑器中编辑](https://image-host.blueberryowo.me/cb8d96c4-8ac5-4b02-a2ac-928dd0a22cec.png)

5. 在记事本中打开后，搜索关键词 `YOUR-GITHUB-TOKEN`，然后会跳转到这个位置。

   ![跳转到的位置](https://image-host.blueberryowo.me/1606ba25-3b83-4c22-a92c-baee199d1e14.png)

在这里我们需要配置自己的信息，从而让文件可以正常上传。请注意，保留最外面的引号只在引号内替换：（以我的用户名举例：从"YOUR-NAME"改成"LeoWang0814"）。

```
    const GITHUB_TOKEN = "YOUR-GITHUB-TOKEN"; //在这里填写我们之前获得的github token密钥
    const REPO_OWNER = "YOUR-NAME"; //在这里填写你的github用户名
    const REPO_NAME  = "YOUR-REPO-NAME"; //在这里填写你的图床仓库模板的仓库名称
    const TARGET_DIR = "public/"; //这里最好不要动，表示所有图片都会上传到仓库里的public/目录下，这样可以避免出现部署到vercel但是资源404的问题。
    const BRANCH     = "main";
    const COMMIT_MESSAGE_PREFIX = "upload:";
    const CONCURRENCY = 3;
    const YOUR_WEBSITE_BASE = "https://your-web-site.com/"; //如果你有自己的网站，请在这里填写，如果没有则留空。
```

修改好之后 Ctrl + S 保存。

6. 接下来退出编辑器，在桌面上双击 `index.html` 打开上传工具。在打开的页面中可以点击右上角的 “Test Token” 按钮测试链接是否有效：如果有效，左下角会显示 Token OK。  
如果 token 错误，请翻看上面获取 token 的方式重新生成，或者**仔细检查**你在工具里面填写的几个信息是否存在错误。

   ![点击Test Token检测token是否有效](https://image-host.blueberryowo.me/d235be1b-fce4-4380-be99-b7ca2f9e02a7.png)

7. 如果 token 没有问题，那么就可以上传一张图片测试了。通过点击按钮选择文件上传，或者直接拖拽文件到指定区域上传之后，我们会拿到两个链接。不管你有没有填写自己的网页，其中第一个都是可以被访问的：这是 github 的资源链接，指向你上传的那张图片。  
如果你的托管文件主要面向国外用户，这个链接基本足够；但对于大陆用户，为了更稳定和快速的访问，我们需要把图床资源部署到 vercel，并配置自己的域名加速。

   ![图片链接](https://image-host.blueberryowo.me/3297ef2a-81ff-4fdd-860b-a282d60419fc.png)

[⬆️ 返回目录](#toc)

---

<a id="step3"></a>

## 第三步：使用 Vercel 部署并使用 Cloudflare 加速我们的域名 🌍⚡

*在这里，我以 cloudflare 为例展示如何通过配置 DNS 记录的方式加速大陆地区的访问。如果你的域名托管在别的平台，操作逻辑也相类似：只需要添加一条 DNS 规则即可。*

我们先把存储图床的仓库部署到 vercel。**如果你没有注册 vercel，可以跟着我操作注册。**

<a id="vercel"></a>

### 1）部署到 Vercel 🚀

1. 打开[vercel](https://vercel.com/signup)，选择 I'm working on personal projects。然后填写你的用户名，并且点击下方的 continue 注册。

   ![注册账号](https://image-host.blueberryowo.me/c1dfae9f-daf6-4ec3-b124-6490b95f9e1c.png)

2. 在弹出的界面中选择 Continue with Github，不要使用别的方式注册。直接使用 github 注册可以让 github 上的上传更新实时同步到 vercel 上。这样你之后配置了 CNAME 的 DNS 的个人网页也会同步更新。简单来说就是：你只需要用本地工具上传图片，你的个人图床网址就可以直接复制使用了。

   ![Continue with Github](https://image-host.blueberryowo.me/bd937893-6100-42c8-a542-cf627283d92f.png)

3. 在弹出来的界面里继续选择 Continue。

   ![Continue](https://image-host.blueberryowo.me/9279a13b-1f06-4bc5-a193-ed086806ec8c.png)

4. 继续选择 Authorize Vercel。

   ![Authorize Vercel](https://image-host.blueberryowo.me/c2993df5-5bac-4d1a-a8d1-bef25b8df922.png)

5. Vercel 可能会要求进行手机号验证。如果出现了手机号验证的要求，按照提示操作即可。
6. 注册好后[跳转到vercel主页](https://vercel.com/dashboard)。在主页点击右上角的 Add New...，然后点击 Project 创建新项目。

   ![创建新项目](https://image-host.blueberryowo.me/05ae76b5-65df-43f8-ad9a-0809d1a786d8.png)

7. 在跳出来的页面中找到之前配置好的图床仓库，并且点击 import。

   ![导入仓库](https://image-host.blueberryowo.me/40c375a6-04b8-4a92-ab7f-42f1484e08dd.png)

8. 给这个 project 起一个名字，然后直接点击 Deploy 部署就可以了。

   ![部署页面](https://image-host.blueberryowo.me/a33cba14-504e-41c1-bcf0-de737b5043a6.png)

9. 如果网页部署成功，你应该会看到这个页面。这个 vercel 的默认页面在大陆**可能**无法直接访问，所以为了提升大陆用户体验，配置一个自己的域名非常有必要。点击 Add Domain 添加你自己的域名，从而实现国内访问加速。

   ![部署成功！](https://image-host.blueberryowo.me/c86af6be-781d-48f9-826a-83298d1ccf4f.png)

10. 在跳转到的页面中点击 “Add Domain”。

    ![添加自己的域名加速访问](https://image-host.blueberryowo.me/b303125b-5f3b-44fb-ad8a-4cb1d53112b1.png)

11. 在跳出的页面中填写你自己的域名。这里我使用了我的网站 `blueberryowo.me` 的子域名 `pic.blueberryowo.me`。填写完成之后点击 Save 保存。

    ![填写你自己的域名](https://image-host.blueberryowo.me/bd84f892-671e-4f1a-8bd4-8da843898512.png)

<a id="dns"></a>

### 2）配置子域名 DNS（Cloudflare 示例）🧩

12. 接下来我们需要配置这个子域名的 DNS。打开你域名托管的平台。这里我把域名托管到了 Cloudflare，所以下述教程将以 Cloudflare 配置 CNAME 的 DNS 作为示例。请添加这样一条 CNAME：其中名称填写我们上面在 vercel 设置的 domain，然后目标填写 `cname-china.vercel-dns.com`，这样大陆用户也可以流畅高速地访问图床上的文件了。  
如果你使用的是其他的域名托管平台，请查找该平台的 DNS 管理教程并添加这一条 CNAME 规则。

   ![管理DNS](https://image-host.blueberryowo.me/b4acc57d-f62e-43b1-9cde-1a5a87a9f079.png)

[⬆️ 返回目录](#toc)

---

<a id="finish"></a>

## 完成与联系 🎉

**至此，你的图床就完全配置好啦！！！🥳**  
本博客中的所有图片都托管在按照这个教程制作的图床。如果觉得这个教程不错的话，麻烦给教程中的项目点个 star 哦！🌟  
有任何问题欢迎通过邮件联系我：`leowang@blueberryowo.me`

[⬆️ 返回顶部](#top)


