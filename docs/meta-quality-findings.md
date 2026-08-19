# Meta quality API findings

A documentação oficial da Meta e a coleção oficial do Postman indicam que o endpoint `/WABA_ID/phone_numbers` retorna `quality_rating` com os valores `GREEN`, `YELLOW`, `RED` e `NA`. O painel deve mapear esses valores para `HIGH`, `MEDIUM`, `LOW` e `UNKNOWN`, preservando também o valor bruto para transparência. A documentação oficial informa ainda que o status do número é obtido pelo campo `status` e que o número precisa estar `CONNECTED` para enviar e receber mensagens.

Referências:

- https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/phone-numbers
- https://www.postman.com/meta/whatsapp-business-platform/request/e9ady51/get-phone-numbers
