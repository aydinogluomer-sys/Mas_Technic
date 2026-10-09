import { Link } from "@/i18n/LocaleLink";
import { ShellSpecTable } from "@/components/shell";
import type { LegalClause } from "@/components/pages/LegalDocument";
import { SALES_EMAIL } from "@/content/claims";
import { ROUTED_LOCALE_CODES, ROUTED_LOCALE_PREFIXES } from "@/i18n/locale";

/* Simplified Chinese translation of `src/pages/CerezPolitikasi.tsx` (L5d).
   Clause ids, order and cross-references are the Turkish document's own. The
   Turkish text is the governing version; this translation awaits native and
   legal review (owner input O16). */
const STORAGE_ROWS: string[][] = [
  ["sb-…-auth-token", "localStorage", "如您已登录，用于保持您的登录状态。", "至您退出登录为止"],
  ["mas_chat_ai_count", "localStorage", "统计每日发送给聊天助手的消息数量。", "至当日结束为止"],
  ["mas_pending_cad_upload", "sessionStorage", "将您在首页拖放的图纸转交至报价表单。", "表单接收后即删除"],
  [
    "mas_lang",
    "localStorage",
    `记住您所选择的界面语言（${ROUTED_LOCALE_CODES}）。仅在您点击某一语言按钮时写入；如您未选择语言，则不会写入。在公开页面上，语言由网址决定（${
    ROUTED_LOCALE_PREFIXES.length === 1 ? "英文页面以 /en 开头" : `非土耳其语页面以各自的前缀开头：${ROUTED_LOCALE_PREFIXES.join(", ")}`
  }）；该记录仅决定客户面板和管理面板的语言。`,
    "至您删除为止",
  ],
  [
    "mas-technic-theme",
    "localStorage",
    "保存界面的浅色/深色配色。由于通知层在每个页面均会加载，该记录会在您打开的每个页面上写入，而不仅限于含有 3D 查看器的页面。",
    "至您删除为止",
  ],
];

export const COOKIES_ZH = {
  eyebrow: "法律文本",
  title: "Cookie 政策",
  lede: "本网站自身的页面不创建任何 Cookie；登录页面上的安全组件会创建一个 Cookie。在您的浏览器中保存的全部记录均已在第 02 条中逐项列明。",
  metaDescription:
    "Mas Technic Cookie 政策——本网站自身的页面不创建 Cookie，登录页面上的 hCaptcha 组件会创建一个 Cookie；在您的浏览器中保存的本地存储记录、其保存期限及删除方法。",
  clauses: [
    {
      id: "cerez-kullanimi",
      title: "Cookie 及唯一的例外",
      body: (
        <div className="shell-prose">
          <p>
            本网站自身的页面不会在您的浏览器中创建 Cookie。本网站亦未使用任何广告 Cookie、分析 Cookie、标签管理器、广告像素或会话录制软件。
          </p>
          <p>
            唯一的例外是登录页面，对此须单独说明：打开
            <Link to="/giris">登录页面</Link>
            时，用于保护表单免受自动登录尝试的 hCaptcha 组件即会加载，并在您的浏览器中创建一个名为 <code>__cf_bm</code> 的 Cookie。该 Cookie 属于 <code>hcaptcha.com</code> 域名，有效期为三十分钟，并带有 <code>httpOnly</code> 标记——即页面脚本无法读取——且仅随发往 hcaptcha.com 的请求一并发送。该组件在页面打开后即刻加载，无需您进行任何点击。其具体情况见第 03 条。
          </p>
          <p>
            这并不意味着本网站不在您的浏览器中保存任何内容。本网站所保存的并非 Cookie，而是您浏览器自身本地存储中的记录；全部记录均列于第 02 条。
          </p>
        </div>
      ),
    },
    {
      id: "tarayici-kayitlari",
      title: "在您的浏览器中保存的记录",
      body: (
        <>
          <div className="shell-doc-table">
            <ShellSpecTable
              caption="本地存储记录"
              note="这些记录并非 Cookie：它们不会随每个 HTTP 请求自动发送，且仅能由本网站自身的页面读取。您可在浏览器开发者工具的“应用 / 存储”部分查看全部记录。"
              headers={["记录", "存储位置", "用途", "保存期限"]}
              numericFrom={4}
              rows={STORAGE_ROWS}
              rowKey={(row) => String(row[0])}
            />
          </div>
          <p className="shell-note">
            上述记录均不用于广告或用户画像。您的浏览器不会自行将其发送至任何地方；唯一的例外是会话密钥——如您已登录，该密钥会附加于发往本网站托管及数据库基础设施的请求中，因为正是它使您保持登录状态。该项传输已列于
            <Link to="/kvkk">个人数据保护告知书（KVKK）</Link>
            第 04 条。
          </p>
        </>
      ),
    },
    {
      id: "ucuncu-taraf",
      title: "第三方请求",
      body: (
        <div className="shell-prose">
          <p>
            您的浏览器向本网站以外发送请求的目标地址逐项列明如下。此处的域名系经实际测量后记录：所列的是您的浏览器实际发送请求的地址，而非仅出现在某一组件的设置中、但从未被调用的地址。
          </p>
          <p>
            <strong>字体。</strong>
            字体从本网站自身的服务器加载；不会为加载字体而向第三方服务器发送请求，也不会创建 Cookie。
          </p>
          <p>
            <strong>
              安全组件——仅限<Link to="/giris">登录页面</Link>。
            </strong>
            该表单通过 hCaptcha 防范自动登录尝试。该组件在页面打开后即刻加载——无需您进行任何操作，也不会征求您的同意——您的浏览器会向 <code>hcaptcha.com</code> 域名下的服务器发送请求，来自该处的框架会嵌入页面，并创建第 01 条所述的 <code>__cf_bm</code> Cookie。如该组件无法加载——例如由于内容拦截工具或网络连接中断——错误日志仍会发送至同一域名；因此，即使在加载失败的情况下也会发出请求。与任何请求一样，接收请求的服务器可获知您的 IP 地址及浏览器信息。此后的情况——即在该处发生的处理——本文不作说明；对于我们无法知悉的环节，我们不代表您作出任何承诺。
          </p>
          <p>
            <strong>托管及数据库基础设施。</strong>
            本网站运行所依托的托管及数据库基础设施位于独立的域名下，因此发往该处的请求同样由您的浏览器发送：在您登录、申请重置密码、提交联系表单或报价流程、在聊天框中输入消息时，以及在您已登录的情况下为保持登录状态时。第 02 条所述的会话密钥会附加于这些请求中；如您仅浏览页面，则不存在可附加的密钥。该情形亦已列于
            <Link to="/kvkk">个人数据保护告知书（KVKK）</Link>
            第 04 条。
          </p>
          <p>
            <strong>通过 Google 或 LinkedIn 登录——仅在您点击相应按钮时。</strong>
            如您点击
            <Link to="/giris">登录页面</Link>
            上的“Google”或“LinkedIn”按钮，您的浏览器将离开本网站：首先前往上一段所述的托管及身份验证基础设施，再由该处前往您所选服务提供方自身的登录页面。如您未点击，则上述请求不会发生。在服务提供方自身页面上发生的情况不属于本文的范围。
          </p>
          <p>
            <strong>聊天助手——仅在您作出 AI 同意时。</strong>
            如您作出同意，截至该时刻的对话内容将通过本网站自身的服务器函数传送至 Google 的 Gemini 服务。该处理不创建 Cookie，但与此处所列的记录不同，相关内容不会保留在您的浏览器中——因此其确切去向载于
            <Link to="/gizlilik-politikasi">隐私政策</Link>
            第 06 条。
          </p>
          <p>
            以上即为请求的全部去向。除此之外，页面中不含任何嵌入的第三方视频、地图、广告或社交媒体组件。
          </p>
        </div>
      ),
    },
    {
      id: "yonetim",
      title: "删除记录",
      body: (
        <div className="shell-prose">
          <p>
            您可随时通过浏览器设置——“清除网站数据”或开发者工具中的“应用 / 存储”部分——删除第 02 条所列的记录。删除记录不会妨碍本网站正常运行；仅会关闭您当前已打开的会话（如有），并重置已记住的偏好设置。
          </p>
          <p>
            由于第 01 条所述的 <code>__cf_bm</code> Cookie 属于 hcaptcha.com 而非本网站的域名，清除本网站的数据并不会将其删除；该 Cookie 须从您浏览器的 Cookie 列表中另行删除，或在三十分钟内自行失效。
          </p>
          <p>
            由于不存在需要删除的跟踪记录，本网站亦不显示单独的“Cookie 偏好设置”窗口。在不进行任何需征得同意的处理时，同意窗口不提供任何信息，只会遮挡页面。
          </p>
        </div>
      ),
    },
    {
      id: "iletisim",
      title: "联系我们",
      body: (
        <div className="shell-prose">
          <p>
            如对本文有任何疑问，您可发送邮件至 {SALES_EMAIL}。有关个人数据处理的框架载于
            <Link to="/kvkk">个人数据保护告知书（KVKK）</Link>
            ，本网站的总体隐私处理方式载于
            <Link to="/gizlilik-politikasi">隐私政策</Link>
            。
          </p>
        </div>
      ),
    },
  ] satisfies LegalClause[],
};
