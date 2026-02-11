# 创建图像（也可编辑图片，推荐使用）

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /v1/images/generations:
    post:
      summary: 创建图像（也可编辑图片，推荐使用）
      deprecated: false
      description: |+
        [图片](https://platform.openai.com/docs/api-reference/images)

        给定提示和/或输入图像，模型将生成新图像。

        相关指南：[图像生成](https://platform.openai.com/docs/guides/images)

        根据提示创建图像。

      tags:
        - 图片生成/nano-banana/image/generations 格式(dalle 格式)
      parameters:
        - name: Authorization
          in: header
          description: ''
          required: false
          example: Bearer {{YOUR_API_KEY}}
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                model:
                  type: string
                  description: 用于图像生成的模型。
                prompt:
                  type: string
                  description: 所需图像的文本描述。最大长度为 1000 个字符。
                'n':
                  type: integer
                  description: 要生成的图像数。必须介于 1 和 10 之间。
                size:
                  type: string
                  description: 生成图像的大小。必须是256x256、512x512或 1024x1024之一。
                quality:
                  type: string
                  description: 将生成的图像的质量。`hd`创建具有更精细细节和更高一致性的图像。此参数仅支持`dall-e-3`.
                  enum:
                    - 4k
                    - 2k
                    - 1k
                  x-apifox-enum:
                    - value: 4k
                      name: ''
                      description: ''
                    - value: 2k
                      name: ''
                      description: ''
                    - value: 1k
                      name: ''
                      description: 默认值
                response_format:
                  type: string
                  description: 返回生成的图像的格式。必须是 或url之一b64_json。
                style:
                  type: string
                  description: >-
                    生成图像的大小。必须是`256x256`、`512x512`或`1024x1024`for之一`dall-e-2`。对于模型来说，必须是`1024x1024`、`1792x1024`、
                    或之一。`1024x1792``dall-e-3`
                user:
                  type: string
                  description: >-
                    生成图像的风格。必须是
                    或`vivid`之一`natural`。生动使模型倾向于生成超真实和戏剧性的图像。自然使模型生成更自然、不太真实的图像。此参数仅支持`dall-e-3`.
                image:
                  type: array
                  items:
                    type: string
                    description: 可以是链接，可以是 b64
                  title: 需要编辑的图片
                  description: 可以是链接，可以是 b64
              required:
                - prompt
              x-apifox-orders:
                - prompt
                - model
                - 'n'
                - quality
                - response_format
                - style
                - user
                - size
                - image
            example: |-
              {
                "model": "gemini-3-pro-image-preview",
                "prompt": "画个类似的图",
                "image":[],
                "n": 1,
                "size": "1024x1024",
                // "quality": "2k"
              }
      responses:
        '200':
          description: ''
          content:
            application/json:
              schema:
                type: object
                properties:
                  created:
                    type: integer
                  data:
                    type: array
                    items:
                      type: object
                      properties:
                        url:
                          type: string
                      required:
                        - url
                      x-apifox-orders:
                        - url
                required:
                  - created
                  - data
                x-apifox-orders:
                  - created
                  - data
          headers: {}
          x-apifox-name: Create image
      security:
        - bearer: []
      x-apifox-folder: 图片生成/nano-banana/image/generations 格式(dalle 格式)
      x-apifox-status: developing
      x-run-in-apifox: https://app.apifox.com/web/project/4690216/apis/api-341602744-run
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