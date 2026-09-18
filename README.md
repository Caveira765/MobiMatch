# 🚗 MobiMatch - Centralizador de Corridas (Uber • 99 • inDrive)

O **MobiMatch** é um aplicativo web progressivo (PWA) e multiplataforma para centralizar a comparação de preços e tempos de chegada entre **Uber**, **99** e **inDrive** em uma única interface, abrindo cada aplicativo diretamente pelo Deep Link oficial.

---

## 📱 Principais Funcionalidades

1. **Busca Unificada com GPS & Autocomplete:**
   - Obtenha sua localização atual com 1 toque no botão **GPS**.
   - Digite qualquer endereço do Brasil (com sugestões instantâneas via OpenStreetMap / Nominatim).
   - Inversão rápida de rota e atalhos rápidos (Aeroporto, Shopping, Centro).

2. **Roteamento & Mapa Interativo em Tempo Real:**
   - Traçado real do trajeto de trânsito em mapa interativo (via OSRM).
   - Cálculo preciso de quilometragem rodada e tempo de trajeto estimado.

3. **Comparador Lado a Lado:**
   - **Uber:** UberX, Uber Comfort e Uber Moto.
   - **99:** 99Pop, 99Plus e 99Moto.
   - **inDrive:** Lance recomendado (Carro e Moto) com faixa de negociação sugerida para aceite imediato pelo motorista.
   - Destaques automáticos: **Menor Preço**, **Mais Rápido** e **Sua Oferta**.
   - Cálculo de economia máxima na rota.

4. **Despachante de Deep Links:**
   - Botões que acionam os esquemas nativos (`uber://`, `taxis99://`, `indriver://`) e Universal Links oficiais nos dispositivos móveis com os pontos de partida e chegada preenchidos.

5. **Calibração de Tarifas & Dinâmica:**
   - Painel para ajustar multiplicador de **Tarifa Dinâmica (Surge)** para horários de pico e chuva.
   - Ajuste de valores de bandeirada e custo por km/minuto da sua cidade.

---

## 🚀 Como Executar Localmente

No terminal (PowerShell), certifique-se de estar na pasta do projeto e execute:

```powershell
npm.cmd run dev
```

O terminal exibirá os endereços de acesso:
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.X.X:5173/
```

---

## 📲 Como Usar no Celular (Android ou iOS)

1. Conecte o celular na **mesma rede Wi-Fi** do computador.
2. Abra o navegador do celular (Chrome no Android ou Safari no iOS) e acesse o endereço de rede:
   `http://192.168.X.X:5173/` (substitua pelo IP mostrado no terminal).
3. **Instale como App na Tela Inicial:**
   - **No Chrome (Android):** Toque nos 3 pontinhos no canto superior e selecione **"Adicionar à tela inicial"** ou **"Instalar aplicativo"**.
   - **No Safari (iOS):** Toque no botão de compartilhar (quadrado com seta) e selecione **"Adicionar à Tela de Início"**.
4. Pronto! Ao clicar em "Abrir Uber", "Abrir 99" ou "Abrir inDrive", o aplicativo nativo instalado no seu celular será acionado com a corrida pronta.
