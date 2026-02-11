#  生成图像(image)

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /flux/v1/image:
    post:
      summary: ' 生成图像(image)'
      deprecated: false
      description: ''
      tags:
        - 图片生成/flux/官方格式
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                prompt:
                  type: string
                width:
                  type: integer
                height:
                  type: integer
              required:
                - prompt
                - width
                - height
              x-apifox-orders:
                - prompt
                - width
                - height
            example:
              prompt: god
              width: 512
              height: 512
      responses:
        '200':
          description: ''
          content:
            application/json:
              schema:
                type: object
                properties: {}
              example:
                id: 8pjvh3rv41rm20ch50ys5n148w
          headers: {}
          x-apifox-name: 成功
      security:
        - bearer: []
      x-apifox-folder: 图片生成/flux/官方格式
      x-apifox-status: released
      x-run-in-apifox: https://app.apifox.com/web/project/4690216/apis/api-201521146-run
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