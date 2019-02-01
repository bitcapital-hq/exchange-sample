**Introduction**
=====

A sample of a token exchange implementing BitCapital services using the SDK.

**Getting started**
=====
Clone the repository into a folder of your preference by using the following command:
```
git clone https://github.com/bitcapital-hq/exchange-sample.git Exchange
```

Then install the required packages with a:
```
yarn install
```

Then, create at least one user (using the /user/register) endpoint and one asset (using the /asset/create endpoint), and set it as the base asset on the `bitcapital.config.ts` file, then, you can create another asset and start trading!

**tax_id field information**
=====
The field "tax_id" refers to the Brazilian CPF ID card, if you do not have a CPF number, you can generate one for free [here](https://www.4devs.com.br/gerador_de_cpf).

Leave all the fields as they are, and click on the "Gerar CPF" button, and the number will show on the "CPF Gerado" textbox. It's up to you to send or not the dashes and dots.
