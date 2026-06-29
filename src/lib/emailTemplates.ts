export function emailTemplate({ title, content }: { title: string; content: string }) {
  return `
    <!DOCTYPE html>
    <html>
      <body
        style="
          margin:0;
          padding:0;
          background:#f7f7f7;
          font-family:Arial, Helvetica, sans-serif;
          color:#222;
        "
      >
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="padding:40px 20px;"
        >
          <tr>
            <td align="center">

              <table
                width="700"
                cellpadding="0"
                cellspacing="0"
                style="
                  max-width:700px;
                  background:#ffffff;
                  border-collapse:collapse;
                "
              >

                <tr>
                  <td
                    style="
                      background:#111111;
                      padding:40px;
                      text-align:center;
                    "
                  >
                    <h1
                      style="
                        color:#ffffff;
                        margin:0;
                        font-size:34px;
                        font-weight:300;
                        letter-spacing:2px;
                      "
                    >
                      Scotland Luxury Estates
                    </h1>

                    <p
                      style="
                        color:#bbbbbb;
                        margin-top:12px;
                        font-size:14px;
                        letter-spacing:3px;
                        text-transform:uppercase;
                      "
                    >
                      Luxury Property Across Scotland
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:50px 40px;">
                    <h2
                      style="
                        margin-top:0;
                        font-size:28px;
                        font-weight:400;
                      "
                    >
                      ${title}
                    </h2>

                    ${content}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      background:#f5f5f5;
                      padding:30px;
                      text-align:center;
                      color:#666666;
                      font-size:13px;
                    "
                  >
                    Scotland Luxury Estates<br />
                    Scotland's Luxury Property Marketplace
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}
