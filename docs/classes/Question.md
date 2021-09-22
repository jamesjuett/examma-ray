[examma-ray](../README.md) / [Exports](../modules.md) / Question

# Class: Question<QT\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `QT` | extends [`ResponseKind`](../modules.md#responsekind)[`ResponseKind`](../modules.md#responsekind) |

## Table of contents

### Constructors

- [constructor](Question.md#constructor)

### Properties

- [defaultGrader](Question.md#defaultgrader)
- [descriptionCache](Question.md#descriptioncache)
- [kind](Question.md#kind)
- [mk_description](Question.md#mk_description)
- [pointsPossible](Question.md#pointspossible)
- [question_id](Question.md#question_id)
- [response](Question.md#response)
- [sampleSolution](Question.md#samplesolution)
- [skins](Question.md#skins)
- [spec](Question.md#spec)
- [tags](Question.md#tags)

### Methods

- [isKind](Question.md#iskind)
- [renderDescription](Question.md#renderdescription)
- [renderResponse](Question.md#renderresponse)

## Constructors

### constructor

• **new Question**<`QT`\>(`spec`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `QT` | extends [`ResponseKind`](../modules.md#responsekind)[`ResponseKind`](../modules.md#responsekind) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `spec` | [`QuestionSpecification`](../modules.md#questionspecification)<`QT`\> |

#### Defined in

[exams.ts:48](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L48)

## Properties

### defaultGrader

• `Optional` `Readonly` **defaultGrader**: [`QuestionGrader`](../interfaces/QuestionGrader.md)<`QT`, `GradingResult`\>

#### Defined in

[exams.ts:42](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L42)

___

### descriptionCache

• `Private` `Readonly` **descriptionCache**: `Object` = `{}`

#### Index signature

▪ [index: `string`]: `string` \| `undefined`

#### Defined in

[exams.ts:44](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L44)

___

### kind

• `Readonly` **kind**: `QT`

#### Defined in

[exams.ts:38](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L38)

___

### mk\_description

• `Readonly` **mk\_description**: `string`

#### Defined in

[exams.ts:36](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L36)

___

### pointsPossible

• `Readonly` **pointsPossible**: `number`

#### Defined in

[exams.ts:37](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L37)

___

### question\_id

• `Readonly` **question\_id**: `string`

#### Defined in

[exams.ts:34](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L34)

___

### response

• `Readonly` **response**: [`ResponseSpecification`](../modules.md#responsespecification)<`QT`\>

#### Defined in

[exams.ts:39](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L39)

___

### sampleSolution

• `Optional` `Readonly` **sampleSolution**: `Exclude`<[`SubmissionType`](../modules.md#submissiontype)<`QT`\>, typeof `BLANK_SUBMISSION`\>

#### Defined in

[exams.ts:41](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L41)

___

### skins

• `Readonly` **skins**: [`SkinGenerator`](../modules.md#skingenerator)

#### Defined in

[exams.ts:40](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L40)

___

### spec

• `Readonly` **spec**: [`QuestionSpecification`](../modules.md#questionspecification)<`QT`\>

#### Defined in

[exams.ts:33](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L33)

___

### tags

• `Readonly` **tags**: readonly `string`[]

#### Defined in

[exams.ts:35](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L35)

## Methods

### isKind

▸ **isKind**<`RK`\>(`kind`): this is Question<RK\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `RK` | extends [`ResponseKind`](../modules.md#responsekind) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `kind` | `RK` |

#### Returns

this is Question<RK\>

#### Defined in

[exams.ts:70](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L70)

___

### renderDescription

▸ **renderDescription**(`skin`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `skin` | [`QuestionSkin`](../modules.md#questionskin) |

#### Returns

`string`

#### Defined in

[exams.ts:66](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L66)

___

### renderResponse

▸ **renderResponse**(`uuid`, `skin?`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `uuid` | `string` |
| `skin?` | [`QuestionSkin`](../modules.md#questionskin) |

#### Returns

`string`

#### Defined in

[exams.ts:62](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L62)
