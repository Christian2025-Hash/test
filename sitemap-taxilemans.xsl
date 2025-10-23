<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">

  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html>
      <head>
        <title>Sitemap</title>
        <style type="text/css">
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #fff;
            color: #333;
            margin: 20px auto;
            max-width: 800px;
            padding: 0 15px;
          }
          h1 {
            text-align: center;
            color: #2c3e50;
            margin-bottom: 20px;
            font-weight: 700;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
          }
          th, td {
            padding: 10px 12px;
            text-align: left;
            font-size: 14px;
          }
          th {
            background: #2980b9;
            color: white;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-weight: 600;
          }
          tr:nth-child(even) {
            background: #f4f6f8;
          }
          tr:hover {
            background: #d6e9fb;
            transition: background-color 0.3s ease;
          }
          td a {
            color: #2980b9;
            text-decoration: none;
            word-break: break-word;
          }
          td a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <h1>Sitemap</h1>
        <table>
          <tr>
            <th>URL</th>
            <th>Dernière modification</th>
            <th>Fréquence</th>
            <th>Priorité</th>
          </tr>
          <xsl:for-each select="//s:url">
            <tr>
              <td>
                <a target="_blank">
                  <xsl:attribute name="href">
                    <xsl:value-of select="s:loc"/>
                  </xsl:attribute>
                  <xsl:value-of select="s:loc"/>
                </a>
              </td>
              <td><xsl:value-of select="s:lastmod"/></td>
              <td><xsl:value-of select="s:changefreq"/></td>
              <td><xsl:value-of select="s:priority"/></td>
            </tr>
          </xsl:for-each>
        </table>
      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>
