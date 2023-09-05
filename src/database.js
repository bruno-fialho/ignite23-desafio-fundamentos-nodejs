import fs from 'node:fs/promises'

const databasePath = new URL('../db.json', import.meta.url)

export class Database {
  #database = {}

  constructor() {
    fs.readFile(databasePath, 'utf-8')
      .then((data) => {
        this.#database = JSON.parse(data)
      })
      .catch(() => {
        this.#persist()
      })
  }

  #persist() {
    console.log('persisting')
    fs.writeFile(databasePath, JSON.stringify(this.#database, null, 2))
  }

  select(table, search) {
    let data = this.#database[table] ?? []

    if (search) {
      data = data.filter(row => {
        return Object.entries(search).some(([key, value]) => {
          return row[key]?.toLowerCase()?.includes(value?.toLowerCase())
        })
      })
    }

    return data
  }

  insert(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data)
    } else {
      this.#database[table] = [data]
    }

    this.#persist()

    return data
  }

  update(table, id, data) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)

    const updatedTask = {
      ...this.#database[table][rowIndex],
      ...data,
      updated_at: new Date(),
    }

    if (rowIndex > -1) {
      this.#database[table][rowIndex] = { id, ...updatedTask }
      this.#persist()
    }
  }
  
  complete(table, id) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)

    let newCompletedAt

    console.log('this.#database[table][rowIndex]', this.#database[table][rowIndex])

    if (this.#database[table][rowIndex]?.completed_at) {
      newCompletedAt = null
    } else {
      newCompletedAt = new Date()
    }

    const updatedTask = {
      ...this.#database[table][rowIndex],
      completed_at: newCompletedAt,
    }

    if (rowIndex > -1) {
      this.#database[table][rowIndex] = { id, ...updatedTask }
      this.#persist()
    }
  }

  delete(table, id) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)
    console.log('delete -> rowIndex', rowIndex)

    if (rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1)
      this.#persist()
    }
  }
}