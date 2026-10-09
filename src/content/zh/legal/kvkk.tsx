import { Link } from "@/i18n/LocaleLink";
import type { LegalClause } from "@/components/pages/LegalDocument";
import { PUBLIC_ADDRESS_LINES, SALES_EMAIL } from "@/content/claims";

/* Simplified Chinese translation of `src/pages/KVKK.tsx` (L5d). Clause ids,
   order and cross-references are the Turkish document's own. The Turkish text
   is the governing version; this translation awaits native and legal review
   (owner input O16). */
export const KVKK_ZH = {
  eyebrow: "法律文本",
  title: "个人数据保护告知书（KVKK）",
  lede: "依据土耳其第 6698 号个人数据保护法：本网站处理哪些个人数据、出于何种目的以及基于何种法律依据。",
  metaDescription:
    "Mas Technic 依据 KVKK 发布的个人数据保护告知书——所处理的个人数据、处理目的与法律依据、传输、保存以及您依据 KVKK 第 11 条享有的权利。",
  clauses: [
    {
      id: "veri-sorumlusu",
      title: "数据控制者",
      body: (
        <div className="shell-prose">
          <p>
            依据土耳其第 6698 号个人数据保护法（KVKK），数据控制者为
            <strong> Mas Technic Makine Sanayi Ltd. Şti.</strong>。
          </p>
          <p>
            {PUBLIC_ADDRESS_LINES.join(" ")} · {SALES_EMAIL}
          </p>
        </div>
      ),
    },
    {
      id: "islenen-veriler",
      title: "所处理的个人数据",
      body: (
        <div className="shell-prose">
          <p>
            本网站仅在您所提供的范围内处理个人数据。通过报价表单，我们接收您的姓名、电子邮箱、公司名称和电话；您随报价请求上传的工程图纸或
            3D 模型文件；以及您开设账户时提供的电子邮箱地址。
          </p>
          <p>
            如您上传的文件内容含有个人数据（例如图纸标题栏中的姓名），该数据同样属于本告知书的适用范围。
          </p>
          <p>
            同一规则亦适用于您在页面角落的聊天框中输入的文字：如您所写内容含有姓名、电话号码或公司名称，该数据同样属于本告知书的适用范围。聊天文字不会保存至本网站的数据库；仅在您作出人工智能同意的情况下才会传输至本网站以外，该传输载于第
            04 条款。
          </p>
        </div>
      ),
    },
    {
      id: "amac-ve-hukuki-sebep",
      title: "处理目的与法律依据",
      body: (
        <div className="shell-prose">
          <p>
            处理数据的目的在于：编制报价、开展可制造性审查、执行订单及生产流程、开具发票，以及就上述事项与您进行沟通。
          </p>
          <p>
            法律依据为：依据 KVKK 第 5/2-c 条，处理与合同的订立或履行直接相关；以及依据第 5/2-ç
            条，履行法定义务。不在上述目的之外进行任何处理；不进行以营销为目的的用户画像，亦不采用自动化决策。
          </p>
        </div>
      ),
    },
    {
      id: "aktarim",
      title: "传输",
      body: (
        <div className="shell-prose">
          <p>
            您的个人数据不会被出售，也不会为营销目的转交给第三方。传输仅在下文逐项列明的情形下发生。
          </p>
          <p>
            <strong>法定要求。</strong>有权公共机关及机构依据法律提出的要求。
          </p>
          <p>
            <strong>托管与数据库。</strong>为运行本网站而使用的托管及数据库基础设施的服务提供商。
          </p>
          <p>
            <strong>登录页面上的安全组件。</strong>{" "}
            当您打开<Link to="/giris">登录页面</Link>时，将加载用于保护表单免受自动登录尝试的 hCaptcha
            组件；您的浏览器会向 <code>hcaptcha.com</code> 域名下的服务器发送请求，您的 IP 地址及浏览器信息随该请求到达上述服务器。此种情形下不征求、亦不取得您的同意：该组件在页面打开后即行加载，无需您进行任何操作。该组件在您浏览器中留下的
            Cookie 及其全部域名载于<Link to="/cerez-politikasi">Cookie 政策</Link>第 01 条和第 03 条。
          </p>
          <p>
            <strong>聊天助手——仅在您作出同意的情况下。</strong>如您在聊天助手中作出人工智能同意，截至该时点的对话内容将经由本网站自有的服务器函数发送至
            Google 的 Gemini 服务。如您不作出同意，该传输绝不会发生。被传输的仅为对话文字：您的 IP
            地址、会话信息或任何其他可识别您身份的数据均不会被发送，因为居间的服务器函数不转发您浏览器的请求头。该文字亦不会保存至本网站的数据库。该传输如何逐步进行，载于
            <Link to="/gizlilik-politikasi">隐私政策</Link>第 06 条。
          </p>
          <p>
            <strong>通过 Google 或 LinkedIn 登录——仅在您点击该按钮的情况下。</strong>{" "}
            如您点击<Link to="/giris">登录页面</Link>上的“Google”或“LinkedIn”按钮，您的浏览器将离开本网站：先转至上述托管及身份验证基础设施，再由此转至您所选提供商自己的登录页面。如您不点击该按钮，该重定向绝不会发生。提供商自己的页面上处理哪些数据，不在本告知书的说明范围之内；该事项属于该提供商自己的隐私告知的内容。
          </p>
          <p>
            <strong>将某项工作交由供应商——在您知情的情况下。</strong>如为执行某项工作而需要将技术文件发送给第三方供应商，仅在您知情的情况下进行。
          </p>
          <p>
            以上即为发生传输的情形。数据到达第三方之后的情况，本文件不作任何说明：那是我们无法看到的领域，我们不会在此写入任何无法代您核实的内容。因此，请勿在聊天框中输入任何您不希望分享的信息；技术细节请使用报价流程——您在该流程中留下的数据和文件不会发送给任何人工智能服务。
          </p>
        </div>
      ),
    },
    {
      id: "saklama",
      title: "保存",
      body: (
        <div className="shell-prose">
          <p>
            个人数据在其处理目的所需的期间内，并在相关法律法规规定的保存义务持续期间内予以保存；该期间届满后，予以删除、销毁或匿名化处理。
          </p>
          <p>
            本告知书不承诺具体的天数或固定的销毁时间表。如您希望删除您的数据，可行使第 06
            条款所述的权利提出请求。
          </p>
        </div>
      ),
    },
    {
      id: "haklariniz",
      title: "您的权利（KVKK 第 11 条）",
      body: (
        <div className="shell-prose">
          <p>
            依据该法第 11
            条，您享有以下权利：了解您的个人数据是否被处理；如已被处理，请求获取相关信息；了解处理目的以及数据是否按该目的使用；知悉数据在土耳其境内或境外被传输至的第三方；如数据处理不完整或不正确，要求予以更正；要求删除或销毁数据；要求将更正和删除事项通知数据被传输至的第三方；对仅通过自动化系统分析所处理数据而产生的对您不利的结果提出异议；以及因违法处理而遭受损害时，要求赔偿损失。
          </p>
        </div>
      ),
    },
    {
      id: "basvuru",
      title: "申请",
      body: (
        <div className="shell-prose">
          <p>
            您可将与上述权利相关的请求发送至 {SALES_EMAIL}。您的申请中须明确载明可用于识别您身份的信息以及您请求的事项。
          </p>
        </div>
      ),
    },
  ] satisfies LegalClause[],
};
