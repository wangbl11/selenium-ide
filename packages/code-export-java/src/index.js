// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import Command from './command'
import Dependencies from './hooks/declareDependencies'
import BeforeEach from './hooks/beforeEach'
import DeclareVariables from './hooks/declareVariables'
import AfterEach from './hooks/afterEach'

export function emitTest(baseUrl, test) {
  global.baseUrl = baseUrl
  const name = sanitizeName(test.name)
  let result = ''
  result += `
    @Test
    public void ${name}() {
    `
  const emittedCommands = test.commands.map(command => {
    return Command.emit(command)
  })
  return Promise.all(emittedCommands)
    .then(results => {
      results.forEach(emittedCommand => {
        result += `    ${emittedCommand}
    `
      })
    })
    .then(() => {
      result += `}`
      result += `\n`
      return emitClass(name, result)
    })
}

export function sanitizeName(input) {
  return input.replace(/([^a-z0-9]+)/gi, '')
}

export function capitalize(input) {
  return input.charAt(0).toUpperCase() + input.substr(1)
}

function emitClass(name, body) {
  let result = ''
  result += Dependencies.emit()
  result += `public class ${capitalize(name)} {`
  result += DeclareVariables.emit()
  result += BeforeEach.emit()
  result += AfterEach.emit()
  result += body
  result += `}\n`
  return result
}