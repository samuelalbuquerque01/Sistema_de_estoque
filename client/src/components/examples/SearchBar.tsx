import SearchBar from '../SearchBar'

export default function SearchBarExample() {
  return (
    <div className="max-w-md">
      <SearchBar
        placeholder="Buscar produtos..."
        onSearch={(value) => console.log('Buscando:', value)}
      />
    </div>
  )
}
