# 生成

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /ideogram/v1/images/generations:
    post:
      summary: 生成
      deprecated: false
      description: ''
      tags:
        - 图片生成/ideogram/openai images格式
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties: {}
            example:
              prompt: god
              size: 1024x1024
      responses:
        '200':
          description: ''
          content:
            application/json:
              schema:
                type: object
                properties: {}
          headers: {}
          x-apifox-name: 成功
      security:
        - bearer: []
      x-apifox-folder: 图片生成/ideogram/openai images格式
      x-apifox-status: released
      x-run-in-apifox: https://app.apifox.com/web/project/4690216/apis/api-210330674-run
components:
  schemas: {}
  securitySchemes:
    bearer:
      type: http
      scheme: bearer
servers:
  - url: https://api.gptgod.online
    description: api.gptgod.online
security:
  - bearer: []

```