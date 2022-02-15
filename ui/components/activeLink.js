import { useRouter } from 'next/router'

function ActiveLink({ children, href }) {
  const router = useRouter()
  const cls = "btn btn-sm rounded-btn " + (router.asPath.startsWith(href) ? "btn-primary" : "btn-ghost");

  const handleClick = (e) => {
    e.preventDefault()
    router.push(href)
  }
  return (
    <a href={href} onClick={handleClick} className={cls}>
      {children}
    </a>
  )
}

export default ActiveLink