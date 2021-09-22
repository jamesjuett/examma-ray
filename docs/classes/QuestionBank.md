[examma-ray](../README.md) / [Exports](../modules.md) / QuestionBank

# Class: QuestionBank

## Table of contents

### Constructors

- [constructor](QuestionBank.md#constructor)

### Properties

- [questions](QuestionBank.md#questions)
- [questionsById](QuestionBank.md#questionsbyid)
- [questionsByTag](QuestionBank.md#questionsbytag)

### Methods

- [getQuestionById](QuestionBank.md#getquestionbyid)
- [getQuestionsByTag](QuestionBank.md#getquestionsbytag)
- [registerQuestion](QuestionBank.md#registerquestion)
- [registerQuestions](QuestionBank.md#registerquestions)

## Constructors

### constructor

• **new QuestionBank**(`questions`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `questions` | readonly ([`QuestionSpecification`](../modules.md#questionspecification)<[`ResponseKind`](../modules.md#responsekind)\> \| [`Question`](Question.md)<[`ResponseKind`](../modules.md#responsekind)\>)[] |

#### Defined in

[QuestionBank.ts:11](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/QuestionBank.ts#L11)

## Properties

### questions

• `Readonly` **questions**: readonly [`Question`](Question.md)<[`ResponseKind`](../modules.md#responsekind)\>[] = `[]`

#### Defined in

[QuestionBank.ts:7](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/QuestionBank.ts#L7)

___

### questionsById

• `Private` `Readonly` **questionsById**: `Object` = `{}`

#### Index signature

▪ [index: `string`]: [`Question`](Question.md) \| `undefined`

#### Defined in

[QuestionBank.ts:8](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/QuestionBank.ts#L8)

___

### questionsByTag

• `Private` `Readonly` **questionsByTag**: `Object` = `{}`

#### Index signature

▪ [index: `string`]: [`Question`](Question.md)[] \| `undefined`

#### Defined in

[QuestionBank.ts:9](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/QuestionBank.ts#L9)

## Methods

### getQuestionById

▸ **getQuestionById**(`id`): `undefined` \| [`Question`](Question.md)<[`ResponseKind`](../modules.md#responsekind)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`undefined` \| [`Question`](Question.md)<[`ResponseKind`](../modules.md#responsekind)\>

#### Defined in

[QuestionBank.ts:30](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/QuestionBank.ts#L30)

___

### getQuestionsByTag

▸ **getQuestionsByTag**(`tag`): [`Question`](Question.md)<[`ResponseKind`](../modules.md#responsekind)\>[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `tag` | `string` |

#### Returns

[`Question`](Question.md)<[`ResponseKind`](../modules.md#responsekind)\>[]

#### Defined in

[QuestionBank.ts:34](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/QuestionBank.ts#L34)

___

### registerQuestion

▸ **registerQuestion**(`q`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `q` | [`QuestionSpecification`](../modules.md#questionspecification)<[`ResponseKind`](../modules.md#responsekind)\> \| [`Question`](Question.md)<[`ResponseKind`](../modules.md#responsekind)\> |

#### Returns

`void`

#### Defined in

[QuestionBank.ts:15](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/QuestionBank.ts#L15)

___

### registerQuestions

▸ **registerQuestions**(`qs`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `qs` | [`QuestionSpecification`](../modules.md#questionspecification)<[`ResponseKind`](../modules.md#responsekind)\>[] |

#### Returns

`void`

#### Defined in

[QuestionBank.ts:26](https://github.com/jamesjuett/examma-ray/blob/cca0d52/src/QuestionBank.ts#L26)
