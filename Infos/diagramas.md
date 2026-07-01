# Diagramas de Casos de Uso (UML Clássico) 📊

Este documento reúne a modelação UML de Casos de Uso da plataforma **The Fourth Lobby**, desenhada com a sintaxe Mermaid para replicar a estrutura clássica de diagramas de casos de uso (Atores à esquerda, fronteira do sistema a delimitar os casos de uso em elipses, ligações sólidas e setas tracejadas com \`<<include>>\` e \`<<extend>>\`).

---

## 1. Módulo de Compra de Bilhetes (Cliente)

```mermaid
flowchart LR
    %% Definição de estilos para imitar UML Clássico
    classDef actor fill:transparent,stroke:transparent,font-weight:bold,color:#fff
    classDef usecase fill:#fff,stroke:#333,stroke-width:1px,color:#000,rx:20px,ry:20px

    %% Ator
    Cliente["👤<br>Cliente"]:::actor

    %% Fronteira do Sistema
    subgraph Sistema [The Fourth Lobby]
        direction TB
        UC1([Ver Eventos]):::usecase
        UC2([Selecionar Bilhete]):::usecase
        UC3([Aplicar Promocode]):::usecase
        UC4([Efetuar Pagamento]):::usecase
        UC5([Gerar QR Code]):::usecase
    end

    %% Ligações Ator -> Casos de Uso (Sólidas sem seta)
    Cliente --- UC1
    Cliente --- UC2

    %% Relacionamentos entre Casos de Uso (Tracejadas com Setas e Estereótipos)
    UC2 -.->|"<<extend>>"| UC3
    UC2 -.->|"<<include>>"| UC4
    UC4 -.->|"<<include>>"| UC5
```

---

## 2. Módulo de Afiliação (Promotor)

```mermaid
flowchart LR
    classDef actor fill:transparent,stroke:transparent,font-weight:bold,color:#fff
    classDef usecase fill:#fff,stroke:#333,stroke-width:1px,color:#000,rx:20px,ry:20px

    %% Ator
    Promotor["👤<br>Promotor"]:::actor

    %% Fronteira do Sistema
    subgraph Sistema [The Fourth Lobby]
        direction TB
        UC1([Partilhar Link de Promotor]):::usecase
        UC2([Consultar Vendas]):::usecase
        UC3([Calcular Comissões]):::usecase
        UC4([Ver Eventos Associados]):::usecase
    end

    %% Ligações Ator -> Casos de Uso
    Promotor --- UC1
    Promotor --- UC2
    Promotor --- UC4

    %% Relacionamentos
    UC2 -.->|"<<include>>"| UC3
```

---

## 3. Gestão e Administração (Organizador)

```mermaid
flowchart LR
    classDef actor fill:transparent,stroke:transparent,font-weight:bold,color:#fff
    classDef usecase fill:#fff,stroke:#333,stroke-width:1px,color:#000,rx:20px,ry:20px

    %% Ator
    Organizador["👑<br>Organizador"]:::actor

    %% Fronteira do Sistema
    subgraph Sistema [The Fourth Lobby]
        direction TB
        UC1([Publicar Evento]):::usecase
        UC2([Preencher Detalhes Básicos]):::usecase
        UC3([Configurar Fases de Venda]):::usecase
        UC4([Gerir Perfil da Label]):::usecase
        UC5([Adicionar Promotor à Equipa]):::usecase
        UC6([Consultar Faturação Global]):::usecase
    end

    %% Ligações Ator -> Casos de Uso
    Organizador --- UC1
    Organizador --- UC4
    Organizador --- UC5
    Organizador --- UC6

    %% Relacionamentos
    UC1 -.->|"<<include>>"| UC2
    UC1 -.->|"<<include>>"| UC3
```
