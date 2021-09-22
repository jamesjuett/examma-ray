[examma-ray](../README.md) / [Exports](../modules.md) / Section

# Class: Section

## Table of contents

### Constructors

- [constructor](Section.md#constructor)

### Properties

- [descriptionCache](Section.md#descriptioncache)
- [mk_description](Section.md#mk_description)
- [mk_reference](Section.md#mk_reference)
- [questions](Section.md#questions)
- [referenceCache](Section.md#referencecache)
- [reference_width](Section.md#reference_width)
- [section_id](Section.md#section_id)
- [skins](Section.md#skins)
- [spec](Section.md#spec)
- [title](Section.md#title)

### Methods

- [renderDescription](Section.md#renderdescription)
- [renderReference](Section.md#renderreference)

## Constructors

### constructor

• **new Section**(`spec`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `spec` | [`SectionSpecification`](../modules.md#sectionspecification) |

#### Defined in

[exams.ts:280](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L280)

## Properties

### descriptionCache

• `Private` `Readonly` **descriptionCache**: `Object` = `{}`

#### Index signature

▪ [index: `string`]: `string` \| `undefined`

#### Defined in

[exams.ts:272](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L272)

___

### mk\_description

• `Readonly` **mk\_description**: `string`

#### Defined in

[exams.ts:261](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L261)

___

### mk\_reference

• `Optional` `Readonly` **mk\_reference**: `string`

#### Defined in

[exams.ts:262](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L262)

___

### questions

• `Readonly` **questions**: ([`QuestionSpecification`](../modules.md#questionspecification)<[`ResponseKind`](../modules.md#responsekind)\> \| [`Question`](Question.md)<[`ResponseKind`](../modules.md#responsekind)\> \| [`QuestionChooser`](../modules.md#questionchooser))[]

#### Defined in

[exams.ts:263](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L263)

___

### referenceCache

• `Private` `Readonly` **referenceCache**: `Object` = `{}`

#### Index signature

▪ [index: `string`]: `string` \| `undefined`

#### Defined in

[exams.ts:276](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L276)

___

### reference\_width

• `Readonly` **reference\_width**: `number`

Desired width of reference material as a percent (e.g. 40 means 40%).
Guaranteed to be an integral value.

#### Defined in

[exams.ts:270](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L270)

___

### section\_id

• `Readonly` **section\_id**: `string`

#### Defined in

[exams.ts:259](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L259)

___

### skins

• `Readonly` **skins**: [`SkinGenerator`](../modules.md#skingenerator)

#### Defined in

[exams.ts:264](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L264)

___

### spec

• `Readonly` **spec**: [`SectionSpecification`](../modules.md#sectionspecification)

#### Defined in

[exams.ts:258](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L258)

___

### title

• `Readonly` **title**: `string`

#### Defined in

[exams.ts:260](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L260)

## Methods

### renderDescription

▸ **renderDescription**(`skin`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `skin` | [`QuestionSkin`](../modules.md#questionskin) |

#### Returns

`string`

#### Defined in

[exams.ts:298](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L298)

___

### renderReference

▸ **renderReference**(`skin`): `undefined` \| `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `skin` | [`QuestionSkin`](../modules.md#questionskin) |

#### Returns

`undefined` \| `string`

#### Defined in

[exams.ts:302](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/exams.ts#L302)
