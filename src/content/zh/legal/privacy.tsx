import { Link } from "@/i18n/LocaleLink";
import type { LegalClause } from "@/components/pages/LegalDocument";
import { SALES_EMAIL } from "@/content/claims";

/* Simplified Chinese translation of `src/pages/GizlilikPolitikasi.tsx` (L5d).
   Clause ids, order and cross-references are the Turkish document's own. The
   Turkish text is the governing version; this translation awaits native and
   legal review (owner input O16). */
export const PRIVACY_ZH = {
  eyebrow: "法律文本",
  title: "隐私政策",
  lede: "本网站如何处理访客数据——以及更重要的是，本网站不做什么。",
  metaDescription:
    "Mas Technic 隐私政策——您向我们提交的信息、保存在您浏览器中的数据、不进行跟踪、第三方请求以及聊天助手向人工智能服务的传输。",
  clauses: [
    {
      id: "kapsam",
      title: "适用范围",
      body: (
        <div className="shell-prose">
          <p>
            本政策说明 mastechnic.com 上的公开页面如何处理访客数据。有关个人数据处理的法律框架、目的、传输以及您的权利，载于另一份文件——
            <Link to="/kvkk">个人数据保护告知书（KVKK）</Link>
            ——两份文本内容互不重复。
          </p>
        </div>
      ),
    },
    {
      id: "toplanan-bilgiler",
      title: "您向我们提交的信息",
      body: (
        <div className="shell-prose">
          <p>
            除非您填写表单，本网站不收集任何个人信息。在报价流程中，我们接收您的姓名、电子邮箱、公司名称和电话，以及您上传的工程图纸或 3D 模型文件。您开设账户时，您的电子邮箱地址将被记录。
          </p>
          <p>
            上述信息仅用于编制报价、进行可制造性评审以及就此与您联系。本网站不保存任何新闻订阅、广告名单或类似的营销记录。
          </p>
          <p>
            您在聊天框中输入的内容不会被保存；但如您表示同意，该内容将被发送至人工智能服务。您在表单中填写的内容遵循第 05 条所述的路径；由于聊天内容的传输独立于该路径，且仅在您同意的情况下进行，故在单独的条款——第 06 条——中加以说明。
          </p>
        </div>
      ),
    },
    {
      id: "tarayici-verisi",
      title: "保存在您浏览器中的数据",
      body: (
        <div className="shell-prose">
          <p>
            本网站自身的页面不创建 Cookie；唯一的例外是嵌入登录页面的安全组件，详见第 05 条。您的偏好设置和会话信息保存在您浏览器自身的本地存储（<code>localStorage</code> /{" "}
            <code>sessionStorage</code>）中，不会随每次请求自动发送至服务器。
          </p>
          <p>
            每项记录的用途及删除方法，在
            <Link to="/cerez-politikasi">Cookie 政策</Link>页面中逐项列明。
          </p>
        </div>
      ),
    },
    {
      id: "izleme-yok",
      title: "跟踪与统计",
      body: (
        <div className="shell-prose">
          <p>
            本网站不运行任何分析工具、标签管理器、广告像素或会话录制软件。本网站不保存页面浏览量、点击热图或访客画像。
          </p>
          <p>
            这也意味着，本网站发布的任何数字均不以阅读量或热度统计为依据；由于不进行此类统计，也不发布此类数字。
          </p>
        </div>
      ),
    },
    {
      id: "ucuncu-taraf-istekleri",
      title: "第三方请求",
      body: (
        <div className="shell-prose">
          <p>
            页面字体从本网站自身的服务器加载；不会为获取字体而向第三方服务器发送请求。
          </p>
          <p>
            您使用报价流程时，表单数据和您上传的文件将被发送至本网站的托管和数据库基础设施。
          </p>
          <p>
            页面中嵌入的唯一第三方组件位于
            <Link to="/giris">登录页面</Link>：该表单通过 hCaptcha 防范自动登录尝试。该组件在页面打开时即被加载——您无需点击任何内容，也不会征求您的同意——页面中会嵌入来自
            <code>hcaptcha.com</code> 域名的框架；由于您的浏览器向这些服务器发送请求，这些服务器可以看到您的 IP 地址和浏览器信息；同时您的浏览器中会创建一个名为 <code>__cf_bm</code>、有效期为三十分钟的 Cookie。该 Cookie 的全部字段载于
            <Link to="/cerez-politikasi">Cookie 政策</Link>的第 01 条。数据到达 hcaptcha.com 之后如何处理，本政策无法说明：第 06 条所述的界限在此同样适用。
          </p>
          <p>
            除此之外，页面中没有嵌入任何第三方视频、地图、广告或社交媒体组件。
          </p>
          <p>
            第二个例外需要单独设立条款：如您向聊天助手作出人工智能使用的同意，您输入的文本将被传输给第三方。传输方式及接收方见第 06 条。两者的区别十分重要：该传输仅在您同意时才会发生，而登录页面上的组件在您打开页面的那一刻即被加载。
          </p>
        </div>
      ),
    },
    {
      id: "sohbet-asistani",
      title: "聊天助手与人工智能",
      body: (
        <div className="shell-prose">
          <p>
            除首页以外的页面角落设有一个聊天框，它以两种不同的方式运作。区别在于您输入的文本去往何处。如您的问题与网站内置的现成问答列表相匹配，答案将在您的浏览器内部找到：在此情况下，不会向任何地方发送请求。
          </p>
          <p>
            如未找到匹配项，助手将暂停并询问您是否使用人工智能。仅当您输入<strong>“是”</strong>——或点击随即出现的「是」按钮——时，截至该时刻的对话内容才会先发送至本网站自身的服务器函数，再由此发送至 Google 的 Gemini 服务（<code>generativelanguage.googleapis.com</code>，
            <code>gemini-2.0-flash</code>）；答案由该服务返回。如您选择“否”或不输入任何内容，则不会发生此传输。同意并非一次取得后即长期有效：对于每一个无法回答的新问题，均会再次征求您的同意。
          </p>
          <p>
            此请求仅发送对话文本：您的 IP 地址、会话信息或任何其他可识别您身份的数据均不会传输给 Google。您输入的内容也不会保存到本网站的数据库——中间的函数仅转发消息，不予保留。聊天框在您浏览器中留下的唯一记录是 <code>mas_chat_ai_count</code>，用于计算每天最多 5 条消息的限额，并列于
            <Link to="/cerez-politikasi">Cookie 政策</Link>的第 02 条。
          </p>
          <p>
            文本到达 Google 之后如何处理，本政策无法说明：那是我们无法看到的地方，我们不会在此写下任何无法代您核实的内容。因此我们明确提醒——请勿在聊天框中输入任何您不希望共享的信息，例如零件编号、公差值、工程图纸内容或贵司名称。技术细节请使用<Link to="/teklif-al">申请报价</Link>流程：您在该处提交的数据和文件遵循第 05 条所述的路径，不会发送至任何人工智能服务。
          </p>
        </div>
      ),
    },
    {
      id: "iletisim",
      title: "联系方式",
      body: (
        <div className="shell-prose">
          <p>
            如对本政策有任何疑问，或有涉及您个人数据的请求，您可以发送邮件至 {SALES_EMAIL}。您依据 KVKK 第 11 条享有的权利的完整清单，载于<Link to="/kvkk">个人数据保护告知书（KVKK）</Link>的第 06 条。
          </p>
        </div>
      ),
    },
  ] satisfies LegalClause[],
};
